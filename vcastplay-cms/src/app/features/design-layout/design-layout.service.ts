import { computed, inject, Injectable, signal } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { v7 as uuidv7 } from 'uuid'
import * as fabric from 'fabric'
import { DesignLayout, HtmlLayer } from './design-layout'
import { Playlist } from '../playlist/playlist'

interface GuideLine {
  line: fabric.Line
}

@Injectable({
  providedIn: 'root',
})
export class DesignLayoutService {

  private canvas!: fabric.Canvas;
  private guidelines: fabric.Line[] = [];
  private animFrameId: number = 0;
  private clipboard: any;
  private undoStack: any[] = [];
  private redoStack: any[] = [];
  private isRestoringState = signal<boolean>(false);
  private snap = 5; // snap threshold in px
  private backgroundColor: string = '#ffffff';

  private designSignal = signal<DesignLayout[]>([]);
  designs = computed(() => this.designSignal());

  isEditMode = signal<boolean>(false);
  loadingSignal = signal<boolean>(false);
  showApprove = signal<boolean>(false);
  showCanvasSize = signal<boolean>(false);
  showContents = signal<boolean>(false);
  showPreview = signal<boolean>(false);
  showInputMarquee = signal<boolean>(false);
  showGridLines = signal<boolean>(false);

  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  DEFAULT_RESOLUTION: any;
  DEFAULT_SCALE = signal<number>(1);
  SELECTION_STYLE = signal<any>({
    borderColor: '#9B5CFA',
    borderScaleFactor: 2,
    cornerStrokeColor: '#8B3DFF',
    cornerColor: '#9B5CFA',
    cornerStyle: 'circle',
    cornerSize: 12,
    transparentCorners: false,
  });
  GUIDELINES_CONFIG = signal<any>({
    /** At what distance from the shape does alignment begin? */
    margin: 4,
    /** Aligning line dimensions */
    width: 1,
    /** Aligning line color */
    color: '#FF00AA',
  });

  HTMLCONTROL_STYLE = {
    mtr: false,
    tl: false,
    tr: false,
    mt: false,
    ml: false,
    mb: false,
    mr: false,
    bl: false,
  };
  LINECONTROL_STYLE = { tl: false, tr: false, bl: false, br: false, mt: false, mb: false };
  TEXTMARQUEECONTROL_STYLE = { tl: false, tr: false, bl: false, br: false, mtr: false };

  selectedDesign = signal<DesignLayout | null>(null);
  selectedArrDesign = signal<DesignLayout[]>([]);

  marqueeControl: FormControl = new FormControl(null);
  zoomControl: FormControl = new FormControl(1, { nonNullable: true });

  designForm: FormGroup = new FormGroup({
    id: new FormControl(0, { nonNullable: true }),
    name: new FormControl('New Design', [Validators.required]),
    description: new FormControl('This is a new design', [Validators.required]),
    type: new FormControl('design', { nonNullable: true }),
    canvas: new FormControl(null),
    thumbnail: new FormControl(null),
    htmlLayers: new FormControl([], { nonNullable: true }),
    duration: new FormControl(5, { nonNullable: true }),
    color: new FormControl('#ffffff', { nonNullable: true }),
    approvedInfo: new FormGroup({
      approvedBy: new FormControl('Admin'),
      approvedOn: new FormControl(new Date()),
      remarks: new FormControl(''),
    }),
    status: new FormControl('active'),
    isActive: new FormControl(false, { nonNullable: true }),
    hasPlaylist: new FormControl(false, { nonNullable: true }),
    screen: new FormControl(null, [Validators.required]),
    createdOn: new FormControl(new Date()),
    updatedOn: new FormControl(new Date()),
    files: new FormControl([], { nonNullable: true }),
  });

  objectPropsForm: FormGroup = new FormGroup({
    font: new FormControl('Arial', { nonNullable: true }),
    size: new FormControl(12, { nonNullable: true }),
    weight: new FormControl(false, { nonNullable: true }),
    italic: new FormControl(false, { nonNullable: true }),
    underline: new FormControl(false, { nonNullable: true }),
    alignment: new FormControl('left', { nonNullable: true }),
    color: new FormControl('#ffffff', { nonNullable: true }),
    fill: new FormControl('#000000', { nonNullable: true }),
    transparent: new FormControl(false, { nonNullable: true }),
    style: new FormControl('fill', { nonNullable: true }),
    strokeWidth: new FormControl(1, { nonNullable: true }),
    duration: new FormControl(20, { nonNullable: true }),
  });

  canvasProps: any = {
    zoom: false,
    move: false,
    drag: false,
    selection: false,
    text: false,
    rect: false,
    line: false,
    image: false,
    video: false,
    content: false,
    marquee: false,
  };

  selectedColor = signal<string>('#000000');
  canvasActiveObject = signal<any>(null);

  cliparts: { name: string; link: string; type: string }[] = [
    { name: 'circle', link: 'assets/cliparts/circle.svg', type: 'clipart' },
    { name: 'cloud', link: 'assets/cliparts/cloud.svg', type: 'clipart' },
    { name: 'flower', link: 'assets/cliparts/flower.svg', type: 'clipart' },
    { name: 'heart', link: 'assets/cliparts/heart.svg', type: 'clipart' },
    { name: 'music', link: 'assets/cliparts/music.svg', type: 'clipart' },
    { name: 'square', link: 'assets/cliparts/square.svg', type: 'clipart' },
    { name: 'star', link: 'assets/cliparts/star.svg', type: 'clipart' },
    { name: 'sun', link: 'assets/cliparts/sun.svg', type: 'clipart' },
    { name: 'tree', link: 'assets/cliparts/tree.svg', type: 'clipart' },
    { name: 'triangle', link: 'assets/cliparts/triangle.svg', type: 'clipart' },
    { name: 'apple', link: 'assets/cliparts/apple.svg', type: 'clipart' },
    { name: 'car', link: 'assets/cliparts/car.svg', type: 'clipart' },
    { name: 'house', link: 'assets/cliparts/house.svg', type: 'clipart' },
    { name: 'balloon', link: 'assets/cliparts/balloon.svg', type: 'clipart' },
    { name: 'book', link: 'assets/cliparts/book.svg', type: 'clipart' },
    { name: 'camera', link: 'assets/cliparts/camera.svg', type: 'clipart' },
    { name: 'fish', link: 'assets/cliparts/fish.svg', type: 'clipart' },
    { name: 'butterfly', link: 'assets/cliparts/butterfly.svg', type: 'clipart' },
    { name: 'tree2', link: 'assets/cliparts/tree2.svg', type: 'clipart' },
    { name: 'cup', link: 'assets/cliparts/cup.svg', type: 'clipart' },
  ];

  constructor() {}

  setCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  getCanvas(): fabric.Canvas {
    return this.canvas
  }

  onLoadDesigns() {
    this.designSignal.set([])
  }

  onGetDesigns() {
    if (this.designs().length == 0) this.onLoadDesigns()
    return this.designs()
  }

  onSaveDesign(canvasContainer: any, design: DesignLayout) {
    const canvas = this.getCanvas()
    canvas.getObjects().forEach((object: any, index: number) => {
      object.set('zIndex', index)
    })

    const canvasData = canvas.toObject([
      'html',
      'data',
      'textBoxProp',
      'rectProp',
      'defaultState',
      'zIndex',
    ])
    const canvasObjects = canvas.getObjects() //canvasData.objects;
    const thumbnail = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })

    const curDurations: number[] = []
    canvasObjects.forEach((object: any, index: number) => {
      if (object.html) {
        const content: any = object.html.content
        curDurations.push(content.duration)
      }
      if (object.data) curDurations.push(object.data.duration)
    })

    const maxDuration = Math.max(...curDurations.filter((duration: number) => duration))
    const curDuration = maxDuration > 0 ? maxDuration : 5

    const tempData = this.designs()
    const { id, status, duration, ...info } = design
    const index = tempData.findIndex((item) => item.id == design.id)

    const hasPlaylist =
      design.htmlLayers.filter((item: HtmlLayer) => !['marquee', 'youtube', 'facebook'].includes(item.type)).length > 0 ? true : false

    if (index !== -1)
      tempData[index] = {
        ...design,
        duration: curDuration,
        canvas: JSON.stringify(canvasData),
        hasPlaylist,
        thumbnail,
        updatedOn: new Date(),
      }
    else
      tempData.push({
        id: tempData.length + 1,
        status: 'pending',
        duration: curDuration,
        ...info,
        canvas: JSON.stringify(canvasData),
        hasPlaylist,
        thumbnail,
        createdOn: new Date(),
        updatedOn: new Date(),
        approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' },
      })

    this.designSignal.set([...tempData])
    console.log(this.designSignal())

    this.totalRecords.set(this.designs().length)
    /**CALL POST API */
  }

  onDeleteDesign(design: DesignLayout) {
    const tempData = this.designs().filter((item) => item.id !== design.id)
    this.designSignal.set([...tempData])

    this.totalRecords.set(this.designs().length)
    /**CALL DELETE API */
  }

  onDuplicateDesign(design: DesignLayout) {
    const tempData = this.designs()
    tempData.push({
      ...design,
      id: tempData.length + 1,
      name: `Copy of ${design.name}`,
      status: 'pending',
      createdOn: new Date(),
      updatedOn: new Date(),
      approvedInfo: { approvedBy: '', approvedOn: null, remarks: '' },
    })
    this.designSignal.set([...tempData])

    this.totalRecords.set(this.designs().length)
    /**CALL POST API */
  }

  /**
   * ====================================================================================================================================
   * Editor Tools
   * ====================================================================================================================================
   */
  onScaleCanvas(canvas: fabric.Canvas, parentElement: any, canvasContainer: any) {
    if (!canvas) return

    const { width, height } = this.DEFAULT_RESOLUTION
    const bounds = parentElement.getBoundingClientRect()
    const fitScale = Math.min(bounds.width / width, bounds.height / height)

    // this.onZoomCanvas(canvas, canvasContainer, factor, true);
    const totalZoom = fitScale
    this.zoomControl.patchValue(totalZoom)
    this.updateCanvasSize(canvas, canvasContainer, totalZoom)
  }

  onZoomCanvas(
    canvas: fabric.Canvas,
    canvasContainer: any,
    factor: number,
    isReset: boolean = false
  ) {
    const totalScale = isReset ? this.DEFAULT_SCALE() : factor
    if (isReset) this.zoomControl.patchValue(totalScale)
    this.updateCanvasSize(canvas, canvasContainer, totalScale)
  }

  onExitCanvas() {
    this.onStopVideosInCanvas(this.canvas)
    if (this.canvas) {
      this.canvas.clear()
      this.canvas.dispose()
      this.canvas = undefined as any
    }
    cancelAnimationFrame(this.animFrameId)
    this.designForm.reset()
    this.showContents.set(false)
  }

  onSelection(canvas: fabric.Canvas) {
    this.onSetCanvasProps('selection', true, 'default')
    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
  }

  onPan(canvas: fabric.Canvas) {
    this.onSetCanvasProps('drag', false, 'grab')
    canvas.discardActiveObject()
    this.onDisableLayersProps(canvas, false)
    this.showContents.set(false)
  }

  onMove(canvas: fabric.Canvas) {
    this.onSetCanvasProps('move', false, 'pointer')
    canvas.discardActiveObject()
    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
  }

  onChangeColor(color: string) {
    const activeObject: any = this.canvas.getActiveObjects()
    activeObject.forEach((object: fabric.FabricObject) => {
      if (object.type === 'rect') object.set('fill', color)
    })
    this.canvas.requestRenderAll()
  }

  onCopyLayers(canvas: fabric.Canvas) {
    const activeObjects = canvas.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) return

    // clone all selected objects
    Promise.all(activeObjects.map((obj) => obj.clone())).then((clones) => {
      clones.forEach((cloned, i) => {
        ;(cloned as any).html = activeObjects[i].get('html')
      })
      this.clipboard = clones // store array
    })
  }

  onCutLayers(canvas: fabric.Canvas) {
    const activeObjects = canvas.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) return

    Promise.all(activeObjects.map((obj) => obj.clone())).then((clones) => {
      clones.forEach((cloned, i) => {
        ;(cloned as any).html = activeObjects[i].get('html')
      })
      this.clipboard = clones // store array of clones
      activeObjects.forEach((obj) => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    })
  }

  onPasteLayers(canvas: fabric.Canvas) {
    const { htmlLayers } = this.designForm.value
    if (!this.clipboard) return

    canvas.discardActiveObject()

    // always treat clipboard as an array
    const clipboardItems = Array.isArray(this.clipboard) ? this.clipboard : [this.clipboard]

    Promise.all(clipboardItems.map((obj) => obj.clone())).then((clones) => {
      clones.forEach((cloned, i) => {
        // ✅ get html from the original clipboard item
        const html = (clipboardItems[i] as any).html

        cloned.set({
          left: (cloned.left += 10),
          top: (cloned.top += 10),
          evented: true,
          selectable: true,
          ...this.SELECTION_STYLE(),
        })

        if (html) {
          const { content, style, type } = html
          const htmlLayer = this.createHtmlLayerFromObject(cloned, uuidv7(), content, style, canvas, type)
          htmlLayers.push(htmlLayer)
          cloned.set('html', htmlLayer)
          cloned.setControlsVisibility(this.HTMLCONTROL_STYLE)
          cloned.set(this.SELECTION_STYLE())
          this.syncDivsWithFabric(canvas, this.designForm.value)
        }

        cloned.setCoords()
        canvas.add(cloned)
      })

      // if multiple objects, select them all
      if (clones.length > 1) {
        const sel = new fabric.ActiveSelection(clones, { canvas })
        canvas.setActiveObject(sel)
      } else {
        canvas.setActiveObject(clones[0])
      }

      canvas.requestRenderAll()
      this.saveState()
    })
  }

  onDuplicateLayer(canvas: fabric.Canvas) {
    const { htmlLayers } = this.designForm.value
    const activeObject = canvas.getActiveObjects()
    if (!activeObject || activeObject.length === 0) return

    const clones: fabric.FabricObject[] = []

    canvas.discardActiveObject()
    Promise.all(
      activeObject.map((object: fabric.FabricObject) =>
        object.clone().then((cloned) => {
          const html = object.get('html')

          cloned.set({
            left: (object.left += 10),
            top: (object.top += 10),
            evented: true,
            selectable: true,
            ...this.SELECTION_STYLE(),
          })

          if (html) {
            const { content, style, type } = html
            const htmlLayer = this.createHtmlLayerFromObject(
              cloned,
              uuidv7(),
              content,
              style,
              canvas,
              type
            )
            htmlLayers.push(htmlLayer)
            cloned.set('html', htmlLayer)
            cloned.setControlsVisibility(this.HTMLCONTROL_STYLE)
            cloned.set(this.SELECTION_STYLE())
          }

          cloned.setCoords()
          canvas.add(cloned)
          clones.push(cloned)
        })
      )
    ).then(() => {
      const selection = new fabric.ActiveSelection(clones, { canvas })

      selection.forEachObject((object: fabric.FabricObject) => {
        const html = object.get('html')
        if (html) object.setControlsVisibility(this.HTMLCONTROL_STYLE)
      })

      selection.set(this.SELECTION_STYLE())
      selection.setCoords()
      this.syncDivsWithFabric(canvas, this.designForm.value)
      canvas.setActiveObject(selection)
      canvas.requestRenderAll()
    })
  }

  onSelectAllLayers(canvas: fabric.Canvas) {
    const objects = canvas.getObjects().filter((object: any) => !object.gridLine)
    if (objects && objects.length > 0) {
      const selection = new fabric.ActiveSelection(objects, { canvas })
      selection.set(this.SELECTION_STYLE())
      selection.setCoords()
      canvas.setActiveObject(selection)
      canvas.requestRenderAll()
    }
  }

  onUnSelectAllLayers(canvas: fabric.Canvas) {
    canvas.discardActiveObject()
    canvas.requestRenderAll()
  }

  onRemoveLayer(canvas: fabric.Canvas) {
    const { htmlLayers } = this.designForm.value
    const activeObject = canvas.getActiveObjects()
    if (!activeObject || activeObject.length == 0) return

    activeObject.forEach((obj: fabric.FabricObject) => {
      // Intended for Playlist object
      const html = obj.get('html')
      if (html) {
        const index = htmlLayers.findIndex((item: HtmlLayer) => item.id == html.id)
        htmlLayers.splice(index, 1);
      }

      canvas.remove(obj)
    })

    canvas.discardActiveObject()
    canvas.requestRenderAll()
    this.onSetCanvasProps('remove', false, 'default')
    this.saveState()
    this.objectPropsForm.reset()
  }

  onUndoLayer() {
    if (this.undoStack.length > 1) {
      const currentState = this.undoStack.pop()!
      this.redoStack.push(currentState)

      const prevState = this.undoStack[this.undoStack.length - 1]!
      this.restoreState(prevState)
    }
  }

  onRedoLayer() {
    if (this.redoStack.length > 0) {
      const state = this.redoStack.pop()!
      this.undoStack.push(state)
      this.restoreState(state)
    }
  }

  onExportCanvas(canvas: fabric.Canvas) {
    const { name, htmlLayers } = this.designForm.value
    const canvasData = canvas.toObject(['html', 'data', 'textBoxProp', 'rectProp', 'defaultState'])

    const length = this.designs().length + 1

    this.designForm.patchValue({
      id: length,
      canvas: JSON.stringify(canvasData),
      htmlLayers,
      createdOn: new Date(),
    })
    const data = JSON.stringify(this.designForm.value)

    const blob = new Blob([data], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  onImportCanvas(event: Event, viewport: any, canvasElement: any) {
    if (this.canvas) this.canvas.dispose()
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const data: any = e.target?.result as string
      const importData: any = JSON.parse(data)
      this.designForm.patchValue(importData)

      this.onEditDesign(viewport, canvasElement, importData)
    }

    reader.readAsText(file)
  }

  /**
   * ====================================================================================================================================
   * Adding layers
   * Text, Rectangle, Image, Line, Video, Marquee and HTML
   * ====================================================================================================================================
   */
  onAddTextToCanvas(
    canvas: fabric.Canvas,
    content: string = 'Enter text here',
    color: string = '#000000'
  ) {
    this.onSetCanvasProps('text', true, 'default')

    canvas.discardActiveObject()
    this.objectPropsForm.reset()

    const tempText = new fabric.FabricText(content, { fontFamily: 'Arial', color, fontSize: 40 })
    const { width, height } = this.canvasDimensions(canvas)
    const left = Math.random() * (width - tempText.width)
    const top = Math.random() * (height - tempText.height)
    const text = new fabric.Textbox(content, {
      left,
      top,
      fontFamily: 'Arial',
      fill: color,
      editable: true,
      width: tempText.width,
    })

    this.objectPropsForm.patchValue({ color, size: text.fontSize })

    text.set('textBoxProp', this.objectPropsForm.value)

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()

    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
    this.saveState()
  }

  onAddTextMarquee(canvas: fabric.Canvas, value: string, fill: string) {
    const { htmlLayers }: any = this.designForm.value
    this.onSetCanvasProps('marquee', true, 'default')
    canvas.discardActiveObject()

    const tempText = new fabric.FabricText(value, { fill: 'white', fontSize: 24 })

    const { width, height } = this.canvasDimensions(canvas)
    const left = Math.random() * (width - tempText.width)
    const top = Math.random() * (height - tempText.height)

    const textWidth = tempText.getScaledWidth()!
    const textHeight = tempText.getScaledHeight()!
    const repeatCount = Math.ceil((textWidth + textHeight) / 50) + 2

    const rect = new fabric.Rect({
      left,
      top,
      width: width / this.DEFAULT_SCALE(),
      height: textHeight,
      fill,
      hasControls: true,
      selectable: true,
      lockRotation: true,
    })

    rect.setControlsVisibility(this.TEXTMARQUEECONTROL_STYLE)

    const htmlLayer: any = this.createHtmlLayerFromObject(
      rect,
      uuidv7(),
      {
        text: tempText.text,
        marquee: true,
        repeat: Array(repeatCount).fill(tempText.text),
      },
      this.objectPropsForm.value,
      canvas,
      'marquee'
    )

    htmlLayers.push(htmlLayer)

    Object.assign(htmlLayer, { style: this.objectPropsForm.value })
    rect.set('html', htmlLayer)

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.requestRenderAll()

    this.syncDivsWithFabric(canvas, this.designForm.value);
    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
    this.saveState()
  }

  onAddShapeToCanvas(canvas: fabric.Canvas, type: string, fill: string = '#808080') {
    this.onSetCanvasProps('rect', true, 'default')
    canvas.discardActiveObject()

    this.objectPropsForm.patchValue({ fill })

    let shape!: fabric.Rect | fabric.Circle | fabric.Triangle | fabric.Ellipse
    switch (type) {
      case 'circle':
        shape = new fabric.Circle({ radius: 50, width: 100, height: 100, fill })
        break
      case 'triangle':
        shape = new fabric.Triangle({ width: 100, height: 100, fill })
        break
      case 'ellipse':
        shape = new fabric.Ellipse({ rx: 50, ry: 25, width: 100, height: 100, fill })
        break
      default:
        shape = new fabric.Rect({ width: 100, height: 100, fill })
        break
    }

    const { width, height } = this.canvasDimensions(canvas)
    const left = Math.random() * (width - shape.getScaledWidth())
    const top = Math.random() * (height - shape.getScaledHeight())

    shape.set({ left, top })

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.requestRenderAll()

    shape.set('rectProp', this.objectPropsForm.value)
    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
    this.saveState()
  }

  onAddImageToCanvas(canvas: fabric.Canvas, data: any) {
    this.onSetCanvasProps('image', true, 'default')
    canvas.discardActiveObject()

    fabric.FabricImage.fromURL(data.link, { crossOrigin: 'anonymous' }, { data }).then((image) => {
      const { width, height } = this.canvasDimensions(canvas) // make sure this gets the canvas size

      // Ensure the image has dimensions
      const imgWidth = image.width ?? 100
      const imgHeight = image.height ?? 100

      // Compute scale so image fits within canvas
      const scaleX = width / imgWidth
      const scaleY = height / imgHeight
      const scale = Math.min(1, scaleX, scaleY)
      image.scale(scale)

      // Compute scaled dimensions
      const scaledWidth = imgWidth * scale
      const scaledHeight = imgHeight * scale

      // Position within canvas (safe inside bounds)
      const left = Math.random() * (width - scaledWidth)
      const top = Math.random() * (height - scaledHeight)

      image.set({
        left,
        top,
        selectable: true,
        hasControls: true,
      })

      // Store extra data if needed
      image.set('data', data)

      // Add to canvas
      canvas.add(image)
      canvas.setActiveObject(image)
      canvas.requestRenderAll()

      // Your custom logic
      this.onDisableLayersProps(canvas, true)
      this.saveState()
    })
  }

  onAddVideoToCanvas(
    canvas: fabric.Canvas,
    data: any,
    autoPlay: boolean = true,
    fabricObject?: fabric.FabricObject | any,
    isViewOnly: boolean = false
  ) {
    const { width, height }: any = data.fileDetails.resolution
    this.onSetCanvasProps('video', true, 'default')

    const video = document.createElement('video')
    const videoSource = document.createElement('source')

    video.appendChild(videoSource)
    videoSource.src = data.link

    video.width = width
    video.height = height
    video.loop = true
    video.muted = true
    video.autoplay = autoPlay
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.load();
    video.currentTime = 0;
    // video.play();
    if (isViewOnly) video.play();

    const videoObj: any = new fabric.FabricImage(video, {
      left: fabricObject?.left ?? 0,
      top: fabricObject?.top ?? 0,
      originX: fabricObject?.originX ?? 'top',
      originY: fabricObject?.originY ?? 'left',
      scaleX: fabricObject?.scaleX ?? 0.2,
      scaleY: fabricObject?.scaleY ?? 0.2,
      objectCaching: false,
      data,
      zIndex: fabricObject?.zIndex ?? 0,
    })    

    videoObj.setControlsVisibility(this.HTMLCONTROL_STYLE)

    videoObj.set('data', { ...data, element: video })

    // ⚡ Wait until first frame is ready
    // video.addEventListener('loadeddata', () => {
    // })
    // canvas.add(videoObj);
    canvas.insertAt(videoObj.zIndex, videoObj)
    canvas.bringObjectForward(videoObj, true);
    canvas.requestRenderAll() // show first frame

    // video.onended = () => video.play().catch((err) => console.warn('Video play failed:', err))

    if (autoPlay) this.onStartVideoRender(canvas)
    this.onDisableLayersProps(canvas, true)
    if (!isViewOnly) this.saveState()
  }

  onAddLineToCanvas(canvas: fabric.Canvas, color: string = '#808080') {
    this.onSetCanvasProps('line', true, 'default')
    canvas.discardActiveObject()
    const line = new fabric.Line([50, 100, 250, 100], {
      stroke: color,
      strokeWidth: 1,
    })

    line.set('lineProp', this.objectPropsForm.value)

    canvas.add(line)
    canvas.setActiveObject(line)
    canvas.requestRenderAll()

    line.setControlsVisibility(this.LINECONTROL_STYLE)
    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
    this.saveState()
  }

  onAddHTMLToCanvas(canvas: fabric.Canvas, content: Playlist | any) {
    const { htmlLayers }: any = this.designForm.value
    this.onSetCanvasProps('content', true, 'default')
    const rect = new fabric.Rect({
      left: 100 + length * 50,
      top: 100 + length * 50,
      width: 500,
      height: 500,
      fill: 'transparent',
      stroke: null,
      strokeWidth: 0,
      hasControls: true,
      selectable: true,
      lockRotation: true,
    })

    // rect.setControlsVisibility(this.HTMLCONTROL_STYLE)

    const htmlLayer: any = this.createHtmlLayerFromObject(rect, uuidv7(), content, null, canvas, content.type)
    htmlLayers.push(htmlLayer)

    rect.set('html', htmlLayer)
    rect.set('data', content)


    canvas.add(rect)
    this.syncDivsWithFabric(canvas, this.designForm.value)
    canvas.setActiveObject(rect)
    canvas.requestRenderAll()

    this.onDisableLayersProps(canvas, true)
    this.showContents.set(false)
    this.saveState()
  }

  /**
   * ====================================================================================================================================
   * Canvas Functions
   * ====================================================================================================================================
   */
  onCreateCanvas(
    viewport: any,
    canvasContainer: any,
    resolution: { width: number; height: number },
    backgroundColor: string = '#ffffff'
  ) {
    const canvas = this.onInitFabricCanvas(viewport, canvasContainer, resolution, backgroundColor)
    canvas.requestRenderAll()
    canvas.setZoom(this.DEFAULT_SCALE())

    this.zoomControl.patchValue(this.DEFAULT_SCALE())
    this.registerCanvasEvents(canvas)
    this.setCanvas(canvas)
    this.saveState()
  }

  onEditDesign(viewport: any, canvasContainer: any, design: DesignLayout) {
    return this.initCanvas(viewport, canvasContainer, design, {
      autoPlayVideos: true,
      isViewOnly: false,
      registerEvents: true,
    })
  }

  onPreloadCanvas(viewport: any, canvasContainer: any, design: DesignLayout, isViewOnly: boolean) {
    return this.initCanvas(viewport, canvasContainer, design, { autoPlayVideos: true, isViewOnly, registerEvents: true, })
  }

  onSetCanvasProps(props: string, canvasSelection: boolean, cursor: string) {
    const keys = Object.keys(this.canvasProps)
    keys.forEach((key) => (this.canvasProps[key] = false))
    if (keys.includes(props)) this.canvasProps[props] = true
    if (this.canvas) {
      this.canvas.selection = canvasSelection
      this.canvas.defaultCursor = cursor
    }
  }

  onMoveObjectToPosition(position: 'forward' | 'backward' | 'front' | 'back') {
    const activeObject: any = this.canvas.getActiveObject()

    switch (position) {
      case 'forward':
        this.canvas.bringObjectForward(activeObject, true)
        break
      case 'backward':
        this.canvas.sendObjectBackwards(activeObject, true)
        break
      case 'front':
        this.canvas.bringObjectToFront(activeObject)
        break
      default:
        this.canvas.sendObjectToBack(activeObject)
        break
    }

    this.canvas.discardActiveObject()
    this.canvas.setActiveObject(activeObject)
    this.canvas.requestRenderAll()
  }

  onLayerAlignment(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const canvas = this.getCanvas()

    const selected = canvas.getActiveObjects()
    if (selected.length < 2) return

    const boundsList = selected.map((obj) => ({ obj, bounds: obj.getBoundingRect() }))

    if (!boundsList.length) return
    let refItem

    switch (direction) {
      case 'left':
        refItem = boundsList.reduce((a, b) => (b.bounds.left < a.bounds.left ? b : a))
        break
      case 'center':
        refItem = boundsList.reduce((a, b) =>
          b.bounds.left + b.bounds.width / 2 < a.bounds.left + a.bounds.width / 2 ? b : a
        )
        break
      case 'right':
        refItem = boundsList.reduce((a, b) =>
          b.bounds.left + b.bounds.width > a.bounds.left + a.bounds.width ? b : a
        )
        break
      case 'top':
        refItem = boundsList.reduce((a, b) => (b.bounds.top < a.bounds.top ? b : a))
        break
      case 'middle':
        refItem = boundsList.reduce((a, b) =>
          b.bounds.top + b.bounds.height / 2 < a.bounds.top + a.bounds.height / 2 ? b : a
        )
        break
      case 'bottom':
        refItem = boundsList.reduce((a, b) =>
          b.bounds.top + b.bounds.height > a.bounds.top + a.bounds.height ? b : a
        )
        break
    }

    if (!refItem) return
    const refBounds = refItem.bounds

    boundsList.forEach(({ obj, bounds }) => {
      switch (direction) {
        case 'left':
          obj.left += refBounds.left - bounds.left
          break
        case 'center':
          obj.left += refBounds.left + refBounds.width / 2 - (bounds.left + bounds.width / 2)
          break
        case 'right':
          obj.left += refBounds.left + refBounds.width - (bounds.left + bounds.width)
          break
        case 'top':
          obj.top += refBounds.top - bounds.top
          break
        case 'middle':
          obj.top += refBounds.top + refBounds.height / 2 - (bounds.top + bounds.height / 2)
          break
        case 'bottom':
          obj.top += refBounds.top + refBounds.height - (bounds.top + bounds.height)
          break
      }
      obj.setCoords()
    })

    canvas.discardActiveObject()
    const newSelection = new fabric.ActiveSelection(selected, { canvas })
    canvas.setActiveObject(newSelection)
    canvas.requestRenderAll()
  }

  onLayerSpacing(axis: 'horizontal' | 'vertical') {
    const canvas = this.getCanvas()
    const selectedObjects = canvas.getActiveObjects()
    if (selectedObjects.length < 3) return // need at least 3 objects

    // Capture bounds once
    const itemsWithBounds = selectedObjects.map((obj) => ({ obj, bounds: obj.getBoundingRect() }))

    // Sort by axis
    const sortedItems = itemsWithBounds.sort((a, b) =>
      axis === 'horizontal' ? a.bounds.left - b.bounds.left : a.bounds.top - b.bounds.top
    )

    const firstItem = sortedItems[0]
    const lastItem = sortedItems[sortedItems.length - 1]

    // Compute available segment between extremes
    const start =
      axis === 'horizontal'
        ? firstItem.bounds.left + firstItem.bounds.width
        : firstItem.bounds.top + firstItem.bounds.height
    const end = axis === 'horizontal' ? lastItem.bounds.left : lastItem.bounds.top

    const numGaps = sortedItems.length - 1

    // Sum widths/heights of all middle items
    const sumMiddleSizes = sortedItems
      .slice(1, -1)
      .reduce((acc, it) => acc + (axis === 'horizontal' ? it.bounds.width : it.bounds.height), 0)

    // Gap size formula
    const available = end - start
    const gap = (available - sumMiddleSizes) / numGaps // can be negative if things overlap

    // Walk from left/top to right/bottom, placing each middle item
    let cursor = start
    for (let i = 1; i < sortedItems.length - 1; i++) {
      const item = sortedItems[i]
      const bounds = item.bounds

      // Target left/top = cursor + gap
      const targetPos = cursor + gap

      if (axis === 'horizontal') {
        // Move by delta between current bounds.left and target left
        item.obj.left += targetPos - bounds.left
        item.obj.setCoords()
        cursor = targetPos + bounds.width // Update cursor to this item's right edge
      } else {
        item.obj.top += targetPos - bounds.top
        item.obj.setCoords()
        cursor = targetPos + bounds.height // Update cursor to this item's bottom edge
      }
    }

    // Reselect so selection box fits new positions
    canvas.discardActiveObject()
    canvas.setActiveObject(new fabric.ActiveSelection(selectedObjects, { canvas }))
    canvas.requestRenderAll()
  }

  onDisableLayersProps(canvas: fabric.Canvas, value: boolean) {
    const objects = canvas.getObjects()
    objects.forEach((object) => {
      object.selectable = value
      object.evented = value
    })
  }

  onPlayVideosInCanvas(canvas: fabric.Canvas) {
    const objects = canvas.getObjects()
    objects.forEach((object: any) => {
      const data = object.data
      if (data && data?.type == 'video' && data.element instanceof HTMLVideoElement) {
        data.element.muted = false;
        data.element.play().catch((err: any) => {
          console.warn('Autoplay blocked for video:', err)
        })
      }
    })
    this.onStartVideoRender(canvas)
  }

  onStopVideosInCanvas(canvas: fabric.Canvas) {
    if (!canvas) return
    const objects = canvas.getObjects()
    objects.forEach((object: any) => {
      const data = object.data;      
      if (data && data?.type == 'video' && data.element instanceof HTMLVideoElement) {
        data.element.muted = true;
        data.element.pause()
        data.element.currentTime = 0
      }
    })

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)
    this.animFrameId = 0
    canvas.requestRenderAll()
  }

  onStartVideoRender(canvas: fabric.Canvas) {
    // if (this.animFrameId) return;
    const render = () => {
      canvas.requestRenderAll()
      this.animFrameId = requestAnimationFrame(render)
    }

    if (!this.animFrameId) this.animFrameId = requestAnimationFrame(render)
  }

  onUpdateTextProperty(canvas: fabric.Canvas, value: any) {
    const { size, weight, italic, underline, alignment, color, font } = value

    const activeObj: any = canvas.getActiveObject()
    // Prevent non-text objects
    if (!activeObj || !['textbox'].includes(activeObj.type)) return

    activeObj.set({
      fontSize: size,
      fontWeight: !weight ? 'normal' : 'bold',
      fontStyle: italic ? 'italic' : 'normal',
      fontFamily: font,
      underline: underline,
      textAlign: alignment,
      fill: color,
    })

    activeObj.set('textBoxProp', value)
    canvas.requestRenderAll()
  }

  onUpdateRectProperty(canvas: fabric.Canvas, value: any) {
    const { fill, transparent, style, strokeWidth } = value
    const activeObj = canvas.getActiveObject()
    // Prevent non-rect objects
    if (!activeObj || !['rect', 'circle', 'triangle', 'ellipse'].includes(activeObj.type)) return

    activeObj.set('strokeDashArray', undefined)
    switch (style) {
      case 'fill':
        activeObj.set({
          stroke: 'transparent',
          fill: transparent ? 'transparent' : fill,
          strokeWidth: 0,
          strokeUniform: false,
        })
        break
      case 'outline':
        activeObj.set({ stroke: fill, strokeWidth, fill: 'transparent', strokeUniform: true })
        break
      case 'dashed':
        activeObj.set('strokeDashArray', [5, 5])
        activeObj.set({ fill: 'transparent', strokeUniform: true })
        break
    }
    activeObj.set('rectProp', value)
    canvas.renderAll()
  }

  onUpdateLineProperty(canvas: fabric.Canvas, value: any) {
    const { fill, strokeWidth } = value
    const activeObj = canvas.getActiveObject()
    // Prevent non-line objects
    if (!activeObj || !['line'].includes(activeObj.type)) return
    activeObj.set({ stroke: fill, strokeWidth })
    activeObj.set('lineProp', value)
    canvas.requestRenderAll()
  }

  onUpdateMarqueeProperty(canvas: fabric.Canvas, value: any) {
    const { fill, transparent, style, strokeWidth } = value
    const { htmlLayers } = this.designForm.value
    const activeObj = canvas.getActiveObject()
    if (!activeObj) return

    // Prevent non-rect and non-html objects
    const html = activeObj.get('html')
    if (html) {
      Object.assign(html, { style: value })
      const layer = htmlLayers.find((layer: HtmlLayer) => layer.id == html.id)

      if (layer) Object.assign(layer, { style: value })

      const activeObj: any = canvas.getActiveObject()
      if (!activeObj) return

      activeObj.set('strokeDashArray', undefined)
      switch (style) {
        case 'fill':
          activeObj.set({
            stroke: 'transparent',
            fill: transparent ? 'transparent' : fill,
            strokeWidth: 0,
            strokeUniform: false,
          })
          break
        case 'outline':
          activeObj.set({ stroke: fill, strokeWidth, fill: 'transparent', strokeUniform: true })
          break
        case 'dashed':
          activeObj.set('strokeDashArray', [5, 5])
          activeObj.set({ fill: 'transparent', strokeUniform: true })
          break
      }
    }

    canvas.requestRenderAll()
  }

  onShowGridLines(canvas: fabric.Canvas, value: boolean) {    
    if (!value) {
      canvas.set('backgroundColor', this.backgroundColor)
    } else {
      this.drawGrid(canvas)
    }
    canvas.requestRenderAll()
  }

  onLayerLock(canvas: fabric.Canvas, value: boolean) {
    const activeObjects = canvas.getActiveObjects()
    if (!activeObjects || activeObjects.length === 0) return

    activeObjects.forEach((object: fabric.FabricObject) => {
      object.set({
        lockMovementX: value,
        lockMovementY: value,
        lockRotation: value,
        lockScalingX: value,
        lockScalingY: value,
        lockUniScaling: value,
        hasControls: !value,
      })
    })
    canvas.requestRenderAll()
  }

  /**
   * ====================================================================================================================================
   * Private methods insert here
   * ====================================================================================================================================
   */
  private onInitFabricCanvas(
    viewport: HTMLElement,
    container: HTMLElement,
    resolution: { width: number; height: number },
    backgroundColor: string = '#ffffff'
  ) {
    const canvasElement = document.createElement('canvas')
    container.appendChild(canvasElement)

    // Calculate scale factor based on parent element
    const bounds = viewport.getBoundingClientRect()
    const scaleX = bounds.width / resolution.width
    const scaleY = bounds.height / resolution.height
    const scale = Math.min(scaleX, scaleY)

    // Calculate new dimensions for container & canvas
    const newWidth = resolution.width * scale
    const newHeight = resolution.height * scale

    // Apply new size to container
    container.style.width = `${newWidth}px`
    container.style.height = `${newHeight}px`

    this.DEFAULT_SCALE.set(scale)
    this.DEFAULT_RESOLUTION = resolution

    return new fabric.Canvas(canvasElement, {
      width: newWidth,
      height: newHeight,
      backgroundColor,
      selection: false,
      preserveObjectStacking: true,
      fireRightClick: true,
      // stopContextMenu: true
    })
  }

  private updateCanvasSize(canvas: fabric.Canvas, canvasContainer: any, zoomLevel: number) {
    const { width, height } = this.DEFAULT_RESOLUTION

    const newContainerWidth = width * zoomLevel
    const newContainerHeight = height * zoomLevel

    canvasContainer.style.width = `${newContainerWidth}px`
    canvasContainer.style.height = `${newContainerHeight}px`

    const bounds = canvasContainer.getBoundingClientRect()
    const containerWidth = bounds.width
    const containerHeight = bounds.height

    canvas.setDimensions({ width: containerWidth, height: containerHeight })
    canvas.setZoom(zoomLevel)
    canvas.requestRenderAll()
  }

  private initCanvas(
    viewport: any,
    canvasElement: any,
    design: DesignLayout,
    options: { autoPlayVideos: boolean; isViewOnly?: boolean; registerEvents?: boolean }
  ) {
    try {
      const { screen, canvas, htmlLayers }: any = design
      const [ width, height ] = screen.displaySettings.resolution.split('x').map(Number)
      const canvasData = JSON.parse(canvas);

      const newCanvas = this.onInitFabricCanvas(
        viewport,
        canvasElement,
        { width, height },
        canvasData.background
      )
      newCanvas.setZoom(this.DEFAULT_SCALE())

      if (!options.isViewOnly) this.setCanvas(newCanvas)

      newCanvas.loadFromJSON(canvasData, () => {
        setTimeout(() => {
          const objects = newCanvas.getObjects()

          // Sort objects by zIndex
          objects.sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0))

          objects.forEach((obj: any) => {
            // if (obj.html) {
            //   const html: any = obj.html
            //   const alreadyExists = htmlLayers.find((item: any) => item.id === html.id)

            //   if (alreadyExists) this.syncDivsWithFabric(newCanvas)
            // } else
            if (obj.data) {
              const data: any = obj.data

              if (data.type === 'video') {                              
                this.onAddVideoToCanvas(
                  newCanvas,
                  data,
                  options.autoPlayVideos,
                  obj,
                  options.isViewOnly
                )
                newCanvas.remove(obj)
              }
            }

            obj.setCoords()
          })

          // View-only canvas tweaks
          if (options.isViewOnly) {
            newCanvas.selection = false
            newCanvas.skipTargetFind = true
          }

          // Register events if required
          if (options.registerEvents) {
            this.registerCanvasEvents(newCanvas)
            // this.registerAlignmentGuides(newCanvas);

            if (!options.isViewOnly) this.saveState()
          }
          this.syncDivsWithFabric(newCanvas, design)
          newCanvas.requestRenderAll()
        }, 10)
      })

      return newCanvas
    } catch (error) {
      console.log('error on initCanvas', error)
      return null
    }
  }

  private captureState(obj: fabric.FabricObject) {
    return {
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      left: obj.left,
      top: obj.top,
      angle: obj.angle,
    }
  }

  private saveState() {
    const canvas = this.getCanvas()
    const { htmlLayers }: any = this.designForm.value
    const canvasState: any = {
      canvas: JSON.stringify(canvas.toObject()),
      htmlLayers: JSON.stringify(htmlLayers),
    }

    const lastState: any = this.undoStack[this.undoStack.length - 1]

    if (
      !lastState ||
      lastState.canvas !== canvasState.canvas ||
      lastState.htmlLayers !== canvasState.htmlLayers
    ) {
      this.undoStack.push(canvasState)
      this.redoStack = []
    }
  }

  private restoreState(state: any) {
    const { screen, color, htmlLayers } = this.designForm.value
    const [width, height] = screen.displaySettings.resolution.split('x')

    const canvas = this.getCanvas()
    this.isRestoringState.set(true)

    const canvasData = JSON.parse(state.canvas)

    canvas.setDimensions({
      width: width * this.DEFAULT_SCALE(),
      height: height * this.DEFAULT_SCALE(),
    })
    canvas.set({ backgroundColor: color })
    canvas.set('preserveObjectStacking', true)
    canvas.set('selection', false)

    canvas.loadFromJSON(canvasData, () => {
      canvas.requestRenderAll()
    })
    if (htmlLayers.length > 0) htmlLayers.set(JSON.parse(state.htmlLayers))
  }

  private canvasDimensions(canvas: fabric.Canvas) {
    return { width: canvas.getWidth(), height: canvas.getHeight() }
  }

  private syncDivsWithFabric(canvas: fabric.Canvas, design: DesignLayout) {
    const events = [
      'object:added',
      'object:moving',
      'object:scaling',
      'object:rotating',
      'object:modified',
      'object:removed',
      'selection:created',
      'selection:updated',
      'selection:cleared',
      'after:render',
    ]

    events.forEach((event: any) =>
      canvas.on(event, () => {
        this.updateHtmlLayers(canvas, design)
      })
    )
  }

  private updateHtmlLayers(canvas: fabric.Canvas, design: DesignLayout) {
    const { htmlLayers }: any = design;
    const activeObjects: fabric.FabricObject[] = canvas.getObjects()   

    activeObjects.forEach((object: fabric.FabricObject) => {
      const html = object.get('html')
      if (!html) return

      const layer = htmlLayers.find((item: any) => item.id == html.id)      

      if (layer) {
        const updated = this.createHtmlLayerFromObject(
          object,
          layer.id,
          layer.content,
          layer.style,
          canvas,
          layer.type
        )
        Object.assign(layer, updated)
      }
    })
  }

  private createHtmlLayerFromObject(
    obj: fabric.FabricObject,
    id: string,
    content: any,
    style: any,
    canvas: fabric.Canvas,
    type: string
  ) {
    const zoom = canvas.getZoom();    

    // Get real screen bounds
    const bounds = obj.getBoundingRect()

    const html = obj.get('html')

    const left = bounds.left * zoom //obj.left * zoom;
    const top = bounds.top * zoom // obj.top * zoom;
    const width = bounds.width * zoom // obj.getScaledWidth() * zoom;
    const height = bounds.height * zoom // obj.getScaledHeight() * zoom;
    const angle = obj.angle || 0

    if (html && !['marquee', 'youtube', 'facebook'].includes(html.type))
      obj.setControlsVisibility({
        mtr: false,
        tl: false,
        tr: false,
        mt: false,
        ml: false,
        mb: false,
        mr: false,
        bl: false,
      })

    return {
      id,
      left,
      top,
      width,
      height,
      rotation: angle,
      content,
      type,
      style,
      fabricObject: obj,
    }
  }

  private registerCanvasEvents(canvas: fabric.Canvas): void {
    canvas.on('selection:created', (e) => {
      const selectedObjects = e.selected || []
      if (selectedObjects.length === 0) return

      if (selectedObjects.length > 1) {
        const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection
        if (activeSelection) {
          activeSelection.set(this.SELECTION_STYLE())
        }
      } else {
        const selected: any = e.selected?.[0]
        if (selected) {
          // this.showContents.set(selected.html ? true : false)
          selected.set(this.SELECTION_STYLE())
          if (selected.type === 'image') {
            this.onSetCanvasProps('image', true, 'default')
          } else if (selected.type === 'textbox') {
            this.objectPropsForm.patchValue(selected.textBoxProp, { emitEvent: false })
            this.onSetCanvasProps('text', true, 'default')
          } else if (
            ['rect', 'circle', 'triangle', 'ellipse'].includes(selected.type) &&
            !selected.html
          ) {
            this.objectPropsForm.patchValue(selected.rectProp)
            this.onSetCanvasProps('rect', true, 'default')
          } else if (selected.type == 'line') {
            this.objectPropsForm.patchValue(selected.lineProp)
            this.onSetCanvasProps('line', true, 'default')
          } else {
            const { content, style, type } = selected.html
            if (type == 'marquee') {
              // this.showContents.set(false)
              this.objectPropsForm.patchValue(style)
              this.onSetCanvasProps('marquee', true, 'default')
            } 
            // else {
            //   this.onSetCanvasProps('content', true, 'default')
            // }
          }
        }
      }
    })

    canvas.on('selection:updated', (e) => {
      const selected: any = e.selected?.[0]
      if (selected) {
        // this.showContents.set(selected.html ? true : false)
        selected.set(this.SELECTION_STYLE())
              
        selected.dirty = true;
        selected.setCoords();
        canvas.requestRenderAll();

        if (selected.type === 'image') {
          this.onSetCanvasProps('image', true, 'default')
        } else if (selected.type === 'textbox') {
          setTimeout(() => {
            const textBoxProp = selected.get('textBoxProp')
            this.objectPropsForm.patchValue(textBoxProp)
            this.onSetCanvasProps('text', true, 'default')
          }, 50)
        } else if (
          ['rect', 'circle', 'triangle', 'ellipse'].includes(selected.type) &&
          !selected.html
        ) {
          setTimeout(() => {
            const rectProp = selected.get('rectProp')
            this.objectPropsForm.patchValue(rectProp)
            this.onSetCanvasProps('rect', true, 'default')
          }, 50)
        } else if (selected.type == 'line') {
          setTimeout(() => {
          const lineProp = selected.get('lineProp')
          this.objectPropsForm.patchValue(lineProp)
          this.onSetCanvasProps('line', true, 'default')
          }, 50)
        } else {
          const { content, style, type } = selected.html
          if (type == 'marquee') {
            // this.showContents.set(false)
            this.objectPropsForm.patchValue(style)
            this.onSetCanvasProps('marquee', true, 'default')
          }
          // else {
          //   this.onSetCanvasProps('content', true, 'default')
          // }
        }
      }
    })

    canvas.on('selection:cleared', () => {
      this.objectPropsForm.reset()
      this.onSetCanvasProps('cleared', true, 'default')
    })

    canvas.on('object:added', (e) => {
      const obj: any = e.target
      if (!obj) return

      // Add duration
      // const data = obj.data;
      // let duration: number += data.duration ?? 5;

      if (!obj.defaultState) {
        obj.defaultState = this.captureState(obj)
      }
    })

    canvas.on('object:removed', (e) => {
      const obj: any = e.target
      if (!obj) return
      obj.defaultState = this.captureState(obj)
    })

    canvas.on('object:modified', (e) => {
      const obj: any = e.target
      if (!obj) return
      obj.defaultState = this.captureState(obj)
    })

    canvas.on('object:moving', (e) => this.showGuidelines(e, canvas))
    canvas.on('object:scaling', (e) => this.showGuidelines(e, canvas))
    canvas.on('mouse:up', () => this.clearGuidelines(canvas))

    canvas.on('mouse:down', (e: any) => {
      if (!e.e) return;

      if (e.e.button == 2) {
        const target = e.target;

        if (target) {
          this.canvas.setActiveObject(target);
        } else {
          this.canvas.discardActiveObject();
        }

        this.canvas.renderAll();
      }
    })
  }

  /**
   * Start Alignment Guides
   */

  private showGuidelines(e: any, canvas: fabric.Canvas): void {
    const { width, height } = this.DEFAULT_RESOLUTION // this.canvasDimensions(canvas);
    this.clearGuidelines(canvas)

    const movingObj = e.target as fabric.FabricObject
    if (!movingObj) return

    // moving object bounds
    const mLeft = movingObj.left!
    const mTop = movingObj.top!
    const mRight = mLeft + movingObj.getScaledWidth()
    const mBottom = mTop + movingObj.getScaledHeight()
    const mCenterX = mLeft + movingObj.getScaledWidth() / 2
    const mCenterY = mTop + movingObj.getScaledHeight() / 2

    // === Snap to canvas edges ===
    const canvasEdges = {
      left: 0,
      right: width - 2,
      top: 0,
      bottom: height - 2,
      centerX: width / 2,
      centerY: height / 2,
    }

    // Compare against canvas edges
    this.checkAndSnap(mLeft, 'left', movingObj, canvasEdges.left, 'left', canvas)
    this.checkAndSnap(mRight, 'right', movingObj, canvasEdges.right, 'right', canvas)
    this.checkAndSnap(mTop, 'top', movingObj, canvasEdges.top, 'top', canvas)
    this.checkAndSnap(mBottom, 'bottom', movingObj, canvasEdges.bottom, 'bottom', canvas)
    this.checkAndSnap(mCenterX, 'centerX', movingObj, canvasEdges.centerX, 'centerX', canvas)
    this.checkAndSnap(mCenterY, 'centerY', movingObj, canvasEdges.centerY, 'centerY', canvas)

    canvas.getObjects().forEach((obj) => {
      if (obj === movingObj) return

      const oLeft = obj.left!
      const oTop = obj.top!
      const oRight = oLeft + obj.getScaledWidth()
      const oBottom = oTop + obj.getScaledHeight()
      const oCenterX = oLeft + obj.getScaledWidth() / 2
      const oCenterY = oTop + obj.getScaledHeight() / 2

      // ---------------- VERTICAL CHECKS ----------------
      this.checkAndSnap(mLeft, 'left', movingObj, oLeft, 'left', canvas)
      this.checkAndSnap(mLeft, 'left', movingObj, oCenterX, 'centerX', canvas)
      this.checkAndSnap(mLeft, 'left', movingObj, oRight, 'right', canvas)

      this.checkAndSnap(mCenterX, 'centerX', movingObj, oLeft, 'left', canvas)
      this.checkAndSnap(mCenterX, 'centerX', movingObj, oCenterX, 'centerX', canvas)
      this.checkAndSnap(mCenterX, 'centerX', movingObj, oRight, 'right', canvas)

      this.checkAndSnap(mRight, 'right', movingObj, oLeft, 'left', canvas)
      this.checkAndSnap(mRight, 'right', movingObj, oCenterX, 'centerX', canvas)
      this.checkAndSnap(mRight, 'right', movingObj, oRight, 'right', canvas)

      // ---------------- HORIZONTAL CHECKS ----------------
      this.checkAndSnap(mTop, 'top', movingObj, oTop, 'top', canvas)
      this.checkAndSnap(mTop, 'top', movingObj, oCenterY, 'centerY', canvas)
      this.checkAndSnap(mTop, 'top', movingObj, oBottom, 'bottom', canvas)

      this.checkAndSnap(mCenterY, 'centerY', movingObj, oTop, 'top', canvas)
      this.checkAndSnap(mCenterY, 'centerY', movingObj, oCenterY, 'centerY', canvas)
      this.checkAndSnap(mCenterY, 'centerY', movingObj, oBottom, 'bottom', canvas)

      this.checkAndSnap(mBottom, 'bottom', movingObj, oTop, 'top', canvas)
      this.checkAndSnap(mBottom, 'bottom', movingObj, oCenterY, 'centerY', canvas)
      this.checkAndSnap(mBottom, 'bottom', movingObj, oBottom, 'bottom', canvas)
    })

    movingObj.setCoords()
    canvas.requestRenderAll()
  }

  private checkAndSnap(
    mVal: number,
    mType: string,
    obj: fabric.Object,
    oVal: number,
    oType: string,
    canvas: fabric.Canvas
  ) {
    const snapDist = this.snap ?? 5
    const tolerance = Math.abs(mVal - oVal)

    if (tolerance >= snapDist) return

    // Draw guide
    const isVertical = mType === 'left' || mType === 'centerX' || mType === 'right'
    const isHorizontal = mType === 'top' || mType === 'centerY' || mType === 'bottom'
    if (isVertical) this.drawGuidelines(canvas, oVal, 'vertical')
    if (isHorizontal) this.drawGuidelines(canvas, oVal, 'horizontal')

    const width = obj.width ?? 0
    const height = obj.height ?? 0
    const scaleX = obj.scaleX ?? 1
    const scaleY = obj.scaleY ?? 1

    if (obj.__corner) {
      // --- Resizing case ---
      if (isVertical) {
        const currentLeft = obj.left ?? 0
        const rightEdge = currentLeft + width * scaleX

        if (mType === 'right') {
          const newWidth = oVal - currentLeft
          obj.set({
            scaleX: Math.max(newWidth / width, 0.01),
          })
        }

        if (mType === 'left') {
          const newWidth = rightEdge - oVal
          obj.set({
            left: oVal,
            scaleX: Math.max(newWidth / width, 0.01),
          })
        }
      }

      if (isHorizontal) {
        const currentTop = obj.top ?? 0
        const bottomEdge = currentTop + height * scaleY

        if (mType === 'bottom') {
          const newHeight = oVal - currentTop
          obj.set({
            scaleY: Math.max(newHeight / height, 0.01),
          })
        }

        if (mType === 'top') {
          const newHeight = bottomEdge - oVal
          obj.set({
            top: oVal,
            scaleY: Math.max(newHeight / height, 0.01),
          })
        }
      }
    } else {
      // --- Moving case ---
      if (isVertical) {
        if (mType === 'left') obj.set({ left: oVal })
        if (mType === 'centerX') obj.set({ left: oVal - (width * scaleX) / 2 })
        if (mType === 'right') obj.set({ left: oVal - width * scaleX })
      }

      if (isHorizontal) {
        if (mType === 'top') obj.set({ top: oVal })
        if (mType === 'centerY') obj.set({ top: oVal - (height * scaleY) / 2 })
        if (mType === 'bottom') obj.set({ top: oVal - height * scaleY })
      }
    }

    obj.setCoords()
    canvas.requestRenderAll()
  }

  private drawGuidelines(canvas: fabric.Canvas, value: number, position: string): void {
    const { width, height } = this.DEFAULT_RESOLUTION
    const lineValue: any =
      position === 'vertical' ? [value, 0, value, height] : [0, value, width, value]
    const line = new fabric.Line(lineValue, {
      stroke: '#FF00AA',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      strokeUniform: true,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    })
    canvas.add(line)
    canvas.requestRenderAll()
    this.guidelines.push(line)
  }

  private clearGuidelines(canvas: fabric.Canvas): void {
    this.guidelines.forEach((line) => canvas.remove(line))
    this.guidelines = []
    canvas.requestRenderAll()
  }

  private drawGrid(canvas: fabric.Canvas, gridSize: number = 54) {
    this.backgroundColor = canvas.get('backgroundColor')
    
    const gridCanvas = document.createElement('canvas')
    gridCanvas.width = gridSize
    gridCanvas.height = gridSize

    const ctx = gridCanvas.getContext('2d')
    if (!ctx) return

    // Background color (white)
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, gridSize, gridSize)

    // Grid line (light gray)
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2

    // Vertical line
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, gridSize + 1)
    ctx.stroke()

    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(gridSize - 1, 0)
    ctx.stroke()

    // Apply as background pattern
    const pattern = new fabric.Pattern({
      source: gridCanvas,
      repeat: 'repeat',
    })

    canvas.set('backgroundColor', pattern)    
    canvas.requestRenderAll()
  }
}
