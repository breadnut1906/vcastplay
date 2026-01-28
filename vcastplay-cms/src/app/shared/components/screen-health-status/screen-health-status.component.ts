import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../../user/screens/screen.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import * as echarts from 'echarts';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-screen-health-status',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-health-status.component.html',
  styleUrl: './screen-health-status.component.scss'
})
export class ScreenHealthStatusComponent {

  @ViewChild('cpuChart') cpuRef: any;
  @ViewChild('diskChart') diskRef: any;
  @ViewChild('memoryChart') memoryRef: any;

  @Input() showHealthCheck = signal<boolean>(false)
  @Input() selectedScreen = signal<Screen | any>(null);

  @Output() showHealthCheckChange = new EventEmitter<any>()

  @HostListener('window:resize')
  onResize() {
    this.cpuChartInstance?.resize();
    this.diskChartInstance?.resize();
    this.memoryChartInstance?.resize();
  }

  screenService = inject(ScreenService);
  webSocket = inject(WebsocketService);
  utils = inject(UtilityService);
  cdr = inject(ChangeDetectorRef);

  screenHealth = signal<any>(null);
  // CPU data
  cpuChartInstance: echarts.ECharts | null = null;
  cpuUsage: number[] = new Array(10).fill(0);

  // Memory data
  memoryChartInstance: echarts.ECharts | null = null;
  memoryUsage: number[] = new Array(10).fill(0);

  // Disk data
  diskChartInstance: echarts.ECharts | null = null;
  diskReadUsage: number[] = new Array(10).fill(0);
  diskWriteUsage: number[] = new Array(10).fill(0);

  constructor() {
    this.socketClient.on('screen:health', (data: any) => {
      this.screenHealth.set(data);
      this.onUpdateCPUUsage(this.cpu);
      this.onUpdateMemoryUsage(this.memory);
      this.onUpdateDiskUsage(this.disk);
    });

    this.socketClient.on('screen:status', (data: any) => {
      const status = data.status;
      if (status == 'disconnected') {
        this.showHealthCheck.set(false);
        this.cdr.detectChanges();
      }
    })
  }

  onHealthCheck(enable: string) {
    const { id } = this.selectedScreen();
    this.screenService.onSendCommand(id, { enable }, 'enable-health-check').subscribe({
      next: () => { },
    })
    if (!this.cpuChartInstance) this.onCPUChartInit();
    if (!this.memoryChartInstance) this.onMemoryChartInit();
    if (!this.diskChartInstance) this.onDiskChartInit();

    this.showHealthCheckChange.emit(enable)

    if (enable == 'off') {
      this.cpuUsage = new Array(10).fill(0);
      this.cpuChartInstance?.clear();
      this.cpuChartInstance?.dispose();
      this.cpuChartInstance = null;

      this.memoryUsage = new Array(10).fill(0);
      this.memoryChartInstance?.clear();
      this.memoryChartInstance?.dispose();
      this.memoryChartInstance = null;

      this.diskReadUsage = new Array(10).fill(0);
      this.diskWriteUsage = new Array(10).fill(0);
      this.diskChartInstance?.clear();
      this.diskChartInstance?.dispose();
      this.diskChartInstance = null;
    }
  }

  onCPUChartInit() {
    const cpuDom = this.cpuRef.nativeElement;
    this.cpuChartInstance = echarts.init(cpuDom);
    const option: echarts.EChartsOption = {
      grid: { left: 40, right: 20, top: 20, bottom: 20 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.cpuUsage.map((_, index) => index),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          type: 'line',
          data: this.cpuUsage,
          symbol: 'none',
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.2 }
        }
      ],
      animation: false
    }
    this.cpuChartInstance.setOption(option);
  }

  onUpdateCPUUsage(data: any) {    
    const load = data.load.replace('%', '');
    this.cpuUsage.push(parseInt(load));
    this.cpuUsage.shift();
    this.cpuUsage.push(load);

    if (this.cpuChartInstance) {
      this.cpuChartInstance.setOption({
        series: [ { data: this.cpuUsage } ]
      });
    }
    this.cdr.detectChanges();
  }

  onMemoryChartInit() {
    const memoryDom = this.memoryRef.nativeElement;
    this.memoryChartInstance = echarts.init(memoryDom);
    const option: echarts.EChartsOption = {
      grid: { left: 40, right: 20, top: 20, bottom: 20 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.memoryUsage.map((_, index) => index),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          type: 'line',
          data: this.memoryUsage,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff0000' },
          areaStyle: { opacity: 0.2, color: '#ff0000' }
        }
      ],
      animation: false
    }
    this.memoryChartInstance.setOption(option);
  }

  onUpdateMemoryUsage(data: any) {    
    const load = data.load.replace('%', '');
    this.memoryUsage.push(parseInt(load));
    this.memoryUsage.shift();
    this.memoryUsage.push(load);

    if (this.memoryChartInstance) {
      this.memoryChartInstance.setOption({
        series: [ { data: this.memoryUsage } ]
      });
    }
    this.cdr.detectChanges();
  }
  
  onDiskChartInit() {
    const diskDom = this.diskRef.nativeElement;
    this.diskChartInstance = echarts.init(diskDom);
    const option: echarts.EChartsOption = {
      legend: {},
      grid: { left: 40, right: 20, top: 20, bottom: 20 },
      xAxis: [
        { type: 'category', boundaryGap: false, data: this.diskReadUsage.map((_, index) => index) },
        { type: 'category', boundaryGap: false, data: this.diskWriteUsage.map((_, index) => index), show: false },
      ],
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          show: false,
          // formatter: '{value}'
        },
      },
      series: [
        {
          name: 'Read',
          type: 'line',
          data: this.diskReadUsage,
          symbol: 'none',
          lineStyle: { width: 2, color: '#00ff00' },
          areaStyle: { opacity: 0.2, color: '#00ff00' }
        },
        {
          name: 'Write',
          type: 'line',
          data: this.diskWriteUsage,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff0000' },
          areaStyle: { opacity: 0.2, color: '#ff0000' }
        },
      ],
      animation: false
    }
    this.diskChartInstance.setOption(option);
  }

  onUpdateDiskUsage(data: any) {  
    const speed = data.readSpeed;  
    const readLoad = Number(data.readSpeed.replace(/[^0-9.]/g, ''));
    const writeLoad = Number(data.writeSpeed.replace(/[^0-9.]/g, ''));
    
    if (/kb\/s/i.test(speed)) this.diskReadUsage.push(readLoad);
    if (/mb\/s/i.test(speed)) this.diskReadUsage.push(readLoad * 1024);
    if (/gb\/s/i.test(speed)) this.diskReadUsage.push(readLoad * 1024 * 1024);

    if (/kb\/s/i.test(speed)) this.diskWriteUsage.push(writeLoad);
    if (/mb\/s/i.test(speed)) this.diskWriteUsage.push(writeLoad * 1024);
    if (/gb\/s/i.test(speed)) this.diskWriteUsage.push(writeLoad * 1024 * 1024);

    this.diskReadUsage.shift();
    this.diskWriteUsage.shift();

    this.diskReadUsage.push(readLoad);   
    this.diskWriteUsage.push(writeLoad); 
    
    if (this.diskChartInstance) {
      this.diskChartInstance.setOption({
        yAxis: { max: Math.max(...this.diskReadUsage, ...this.diskWriteUsage) },
        series: [ { data: this.diskReadUsage }, { data: this.diskWriteUsage } ]
      });
    }
    this.cdr.detectChanges();
  }


  get socketClient() { return this.webSocket.socketClient; }
  get healthInfo() { return this.screenHealth()?.healthInfo; }
  get cpu() { return this.healthInfo?.cpu; }
  get disk() { return this.healthInfo?.disk; }
  get memory() { return this.healthInfo?.memory; }
}
