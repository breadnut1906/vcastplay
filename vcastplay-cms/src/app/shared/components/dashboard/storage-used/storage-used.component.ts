import { Component } from '@angular/core';
import { ECharts } from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-storage-used',
  imports: [ PrimengUiModule ],
  templateUrl: './storage-used.component.html',
  styleUrl: './storage-used.component.scss'
})
export class StorageUsedComponent {

  chartInstance!: ECharts;
  chartData: any[] = [
    { value: 3, name: 'Total', itemStyle: { color: '#4BC0C0' } },
    { value: 2, name: 'Remaining', itemStyle: { color: '#FF6384' } },
  ];
  options: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '70%'],
        startAngle: 180,
        endAngle: 360,
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
