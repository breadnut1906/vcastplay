import { Component, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { DesignLayout } from '../design-layout';
import { DesignLayoutService } from '../design-layout.service';
import * as fabric from 'fabric';
import { PlaylistPlayerComponent } from '../../playlist/playlist-player/playlist-player.component';
import { CommonModule } from '@angular/common';
import { AssetPreviewComponent } from '../../assets/asset-preview/asset-preview.component';

@Component({
  selector: 'app-design-layout-preview',
  imports: [
    CommonModule,
    forwardRef(() => PlaylistPlayerComponent),
    forwardRef(() => AssetPreviewComponent)
  ],
  templateUrl: './design-layout-preview.component.html',
  styleUrl: './design-layout-preview.component.scss'
})
export class DesignLayoutPreviewComponent {
  
  @Input() viewport: HTMLDivElement | any;
  @Input() designLayout: DesignLayout | any;
  @Input() isPlaying: boolean = false;
  @Input() isPreview: boolean = false;

  @Output() onCanvasChange = new EventEmitter<any>();

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  designlayoutService = inject(DesignLayoutService);
  private canvas: fabric.Canvas | any = null;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const canvasContainer = this.canvasContainer.nativeElement; 
    this.designlayoutService.onScaleCanvas(this.canvas, this.viewport, canvasContainer);
  }

  ngOnChanges(changes: SimpleChanges) {     
    if (this.canvas && this.isPlaying) {
      Promise.resolve().then(() => {        
        this.designlayoutService.onPlayVideosInCanvas(this.canvas);
        this.onCanvasChange.emit(this.canvas);
      })
    } else if (this.canvas && !this.isPlaying) {
      this.designlayoutService.onStopVideosInCanvas(this.canvas);
    } else this.onRenderCanvas();
  }

  ngOnDestroy() {    
    if (this.canvas) {
      this.designlayoutService.onStopVideosInCanvas(this.canvas);
      this.canvas = null;
    }
  }

  onRenderCanvas() {    
    const container = this.canvasContainer.nativeElement;    
    Promise.resolve().then(() => {
      this.canvas = this.designlayoutService.onPreloadCanvas(this.viewport, container, this.designLayout, this.isPreview);
      // if (this.isPlaying) this.designlayoutService.onPlayVideosInCanvas(this.canvas);
    })
  }

  onRemoveCanvas() {
    if (this.canvas) {
      const canvasElement = document.querySelector('canvas');
      canvasElement?.remove();
    }
  }

  trackById(index: number, item: any) {
    return item.id; // unique ID
  }
}
