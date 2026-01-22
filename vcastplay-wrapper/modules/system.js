const { app, screen, nativeImage, Tray, Menu } = require('electron')
const { exec, spawn } = require('child_process')

const os = require('os')
const si = require('systeminformation')
const path = require('path')
const fs = require('fs')

// Create log directory for Content PLayback logs
const logDir = path.join(app.getPath('userData'), 'logs')
const logFile = path.join(logDir, 'content.log')

async function onGetSystemInfo() {

  const hostname = os.hostname()
  const net = os.networkInterfaces()
  const cpu = await si.cpu()
  const temp = await onGetCPUTemperature();
  const mem = await si.mem()
  const disk = await si.fsSize()
  const osInfo = await si.osInfo()
  const system = await si.system()
  const display = screen.getPrimaryDisplay()
  const graphics = await si.graphics()  
  
  return {
    hostname,
    ip:
      Object.values(net)
        .flat()
        .filter((i) => i.family === 'IPv4' && !i.internal)[0]?.address || 'N/A',
    cpu: cpu.manufacturer + ' ' + cpu.brand,
    cpuTemp: temp,
    ram: (mem.total / 1e9).toFixed(2) + ' GB',
    disk: disk.map((d) => ({
      mount: d.mount, 
      size: d.size,
      used: d.used,
      free: d.available,
    })),
    os: osInfo.distro + ' ' + osInfo.release,
    serial: system.uuid,
    browserVersion: process.versions.chrome,
    screen: display.size,
    graphics: graphics,
    appVersion: app.getVersion()
  }
}

async function onSystemCommand(action, appName) {
  const commands = {
    shutdown: 'shutdown -s -t 0',
    restart: 'shutdown -r -t 0',
    openApp: `start ${appName}`,
    open: `${process.env.COMSPEC} /c start "" /min "${appName}" --tray`,
    close: `taskkill /IM ${appName} /T /F`,
    find: `tasklist /FI "IMAGENAME eq ${appName}"`,
  }
  return new Promise((resolve, reject) => {
    exec(commands[action], (err, stdout) => {
      if (err) reject('Failed')
      else resolve(Boolean(stdout) && stdout.includes(appName))
    })
  })
}

function onCreateTray(window) {
  return new Promise((resolve, reject) => {
    try {
      const icon = path.join(__dirname, '../assets/favicon.png')
      const trayIcon = nativeImage.createFromPath(icon)
      const tray = new Tray(trayIcon)

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show App',
          click: () => window.show(),
        },
        {
          label: 'Exit App',
          click: () => {
            app.isQuiting = true
            tray.destroy()
            app.quit()
          },
        },
      ])

      tray.setToolTip('VCastPlay')
      tray.setContextMenu(contextMenu)

      resolve(tray)
    } catch (error) {
      reject(error)
    }
  })
}

async function onTakeScreenShot() {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] })

  for (const source of sources) {
    if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
          },
        },
      })

      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const image = canvas.toDataURL('image/png')
      stream.getTracks()[0].stop()

      console.log(image)

      return image
    }
  }
}

function onDeleteFolder(folderName) {
  return new Promise((resolve, reject) => {
    try {
      const downloadDir = path.join(app.getPath('downloads'), folderName)
      if (fs.existsSync(downloadDir)) {
        fs.rm(downloadDir, { recursive: true, force: true }, (err) => {
          if (err) reject(err)
          else resolve(`${downloadDir} deleted successfully`)
        })
      } else {
        resolve(`${downloadDir} does not exist`)
      }
    } catch (error) {
      reject(error)
    }
  })
}

function onApplySettings(window, data) {
  return new Promise((resolve, reject) => {
    try {
      const { width, height, top, left, resizable, fullscreen, alwaysOnTop, audio, displayId } = data || {}

      window.setFullScreen(fullscreen)
      window.setResizable(resizable)
      window.setAlwaysOnTop(alwaysOnTop)
      window.webContents.setAudioMuted(audio)

      if (displayId) {
        const display = screen.getAllDisplays().find((d) => d.id === displayId);
        const { x, y } = display.bounds;
        window.setPosition(Math.round(x), Math.round(y), false)
      } else {
        window.setPosition(Math.round(left), Math.round(top), false)
      }
      window.setSize(width, height, false)

      resolve('Settings applied successfully')
    } catch (error) {
      reject(error)
    }
  })
}

function onSaveContentLogs(message) {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = new Date().toISOString()
      const logMessage = `${timestamp}: ${message}\n`

      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir)
      }

      fs.appendFileSync(logFile, logMessage)
      resolve('Log saved successfully')
    } catch (error) {
      reject(error)
    }
  })
}

async function onDeleteContentLogs() {
  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile)
        resolve('Log deleted successfully')
      }
    } catch (error) {
      reject(error)
    }
  })
}

async function onGetDisplays() {
  return new Promise((resolve, reject) => {
    try {
      const displays = screen.getAllDisplays().map((display) => ({
        id: display.id,
        name: display.label == '' ? `Default Display` : display.label,
        bounds: display.bounds,
        label: `Display ${display.id} (${display.bounds.width}x${display.bounds.height})`,
      }))
      resolve(displays)
    } catch (error) {
      reject(error)
    }
  })
}

async function onGetCPUTemperature() {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const res = await fetch('http://localhost:8085/data.json');
    const data = await res.json();

    if (!data) return null;

    const temp = onGetCPUPackageTemp(data);
    return temp;
  } catch (error) {
    console.error('onGetCPUTemperature', error);
    return null;
  }
}

function onGetCPUPackageTemp(node, sensorName = 'CPU Package') {
  if (!node) return null;
  
  if (node.Text === sensorName && node.Value.includes('°C')) return node.Value;

  if (node.Children) {
    for (let child of node.Children) {
      let result = onGetCPUPackageTemp(child, sensorName);
      if (result) return result;
    }
  }

  return null;
}

module.exports = {
  onGetSystemInfo,
  onSystemCommand,
  onCreateTray,
  onTakeScreenShot,
  onDeleteFolder,
  onApplySettings,
  onSaveContentLogs,
  onDeleteContentLogs,
  onGetDisplays,
}
