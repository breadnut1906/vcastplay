import { Component } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { ECharts } from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';

@Component({
  selector: 'app-screen-status',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-status.component.html',
  styleUrl: './screen-status.component.scss'
})
export class ScreenStatusComponent {

  chartInstance!: ECharts;
  chartData: any[] = [
    { value: 3, name: 'Online', itemStyle: { color: '#4BC0C0' } },
    { value: 2, name: 'Offline', itemStyle: { color: '#FF6384' } }
  ];
  options: EChartsOption = {
    legend: {
      show: true, // Show or hide legend
      orient: 'horizontal', // 'horizontal' or 'vertical'
      left: 'center', // Position: 'left', 'right', 'center', or pixel/percent
      top: 'bottom', // Can also be 'bottom', 'middle', etc.
      data: ['Online', 'Offline'], // Names matching series.name
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: '80%',
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: false,
          }
        },
        labelLine: {
          show: false
        },
        data: [ ]
      }
    ]
  };

  ngOnInit() {
    this.onInitializedChartData();
  }
  
  ngAfterViewInit() { }

  onChartInit(chart: ECharts) {    
    chart.on('click', (params) => {
      console.log('Clicked bar data:', params);
      console.log(`You clicked on ${params.name} with value ${params.value}`);
    });
  }

  onInitializedChartData() {
    const series: any = this.options.series;
    
    if (!series[0].data) {
      series[0].data = [];
    }

    this.chartData.forEach(data => {
      series[0].data.push(data);
    });
  }
}
