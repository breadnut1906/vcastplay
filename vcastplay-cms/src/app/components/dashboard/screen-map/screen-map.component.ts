import { Component, computed, effect, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Screen } from '../../../core/interfaces/screen';
import * as L from 'leaflet';
import 'leaflet';
import 'leaflet.markercluster';
import { UtilityService } from '../../../core/services/utility.service';
import { ScreenService } from '../../../core/services/screen.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-screen-map',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-map.component.html',
  styleUrl: './screen-map.component.scss'
})
export class ScreenMapComponent {
  
  screenService = inject(ScreenService);
  router = inject(Router);

  keywords = signal<string>('');
  status = signal<string>('All');
  drawerVisible = signal<boolean>(false);

  statusOptions: any[] =[
    { label: 'All', value: 'All' },
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' }
  ]
  showFilter = signal<boolean>(false);
  
  private map!: L.Map;
  private markerClusterGroup: any; 

  tileLink: string = 'https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=sWmX5SwjXmDHtQNDFmI7CyUgBqUvRzxpT6CM5sSbBLqxd3bpJxNNAZ2O4Rivf1Eo';

  screens = signal<Screen[]>([]);
  
  filterScreens = computed(() => {
    return this.screenService.screens().filter(screen =>
      screen.name.toLowerCase().includes(this.keywords().toLowerCase() || '') && (this.status() === 'All' || screen.status?.toLowerCase() === this.status().toLowerCase())
    );
  });

  onCreateDivIcon(screen: Screen) {
    return L.divIcon({
      className: `custom-marker`,
      html: `<div class="marker-dot flex flex-col justify-center items-center rounded-sm text-white p-3">
              <div class="flex justify-center items-center gap-3 text-center text-sm w-full">
                <i class="pi pi-desktop"></i>
              </div> 
            </div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }

  constructor(public utils: UtilityService) {
    effect(() => {
      this.initializeMap();
    })
  }

  ngOnInit() {
    this.screenService.onGetScreens();
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  initializeMap() {
    this.selectedScreen.set(null);
    this.isEditMode.set(false);
        
    if (this.map) this.map.remove();
    this.map = L.map('screenMap', { center: [14.6090, 121.0223], zoom: 12, minZoom: 3, zoomControl: false, attributionControl: false });    
    
    L.tileLayer(this.tileLink, { maxZoom: 22 }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: true,
      iconCreateFunction: function (cluster: any) {
        return L.divIcon({
          html: `<div class="circle blue">${cluster.getChildCount()}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [32, 32]
        });
      }
    });

    this.map.addLayer(this.markerClusterGroup);
    // this.onAddMarkers();
  }
  // onAddMarkers(): void {
  //   this.filterScreens().forEach(screen => {
  //     const marker = L.marker([screen.geolocation.latitude, screen.geolocation.longitude], {
  //       icon: this.onCreateDivIcon(screen)
  //     }).bindTooltip(screen.name, {
  //       permanent: false,
  //       direction: 'top',
  //       opacity: 0.9
  //     });

  //     this.markerClusterGroup.addLayer(marker);
      
  //     marker.on('click', ({ latlng }: any) => {
  //       const { lat, lng } = latlng;
  //       const screen: any = this.filterScreens().find(screen => screen.geolocation.latitude === lat && screen.geolocation.longitude === lng);
  //       this.selectedScreen.set(screen);
  //       if (!this.isMobile) this.map.flyTo({ lat: lat - 0.00005, lng }, 22);
  //       this.drawerVisible.set(true);
  //     })
  //   });
  // }
  onClickScreen(screen: any) {
    this.selectedScreen.set(screen);
    this.map.flyTo({ lat: screen.geolocation.latitude, lng: screen.geolocation.longitude }, 22);
    this.drawerVisible.set(true);
  }

  onClickEdit(item: any) {
    this.isEditMode.set(true);
    this.selectedScreen.set(item);
    this.router.navigate([ '/screens/screen-details', item.code ]);
  }

  onClickCancel() {
    this.selectedScreen.set(null); 
    this.initializeMap();
  }

  get selectedScreen() {
    return this.screenService.selectedScreen;
  }

  get isEditMode() {
    return this.screenService.isEditMode;
  }

  get isMobile() {
    return this.utils.isMobile();
  }
}
