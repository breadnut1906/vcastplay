import { Component, computed, effect, signal } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { Screen } from '../../../../user/screens/screen';
import { UtilityService } from '../../../../core/services/utility.service';


@Component({
  selector: 'app-screen-lists',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-lists.component.html',
  styleUrl: './screen-lists.component.scss'
})
export class ScreenListsComponent {

  keywords = signal<string>('');
  status = signal<string>('All');
  statusOptions: any[] =[
    { label: 'All', value: 'All' },
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' }
  ]

  columnHeaders: string[] = ['Name', 'Resolution', 'Orientation', 'Status', 'Actions'];
  screens = signal<Screen[]>([])

  filterScreens = computed(() => {
    return this.screens().filter(screen =>
      screen.name.toLowerCase().includes(this.keywords().toLowerCase() || '') && (this.status() === 'All' || screen.status.toLowerCase() === this.status().toLowerCase())
    );
  });

  constructor(public utils: UtilityService) { }

  ngOnInit() { }  
}
