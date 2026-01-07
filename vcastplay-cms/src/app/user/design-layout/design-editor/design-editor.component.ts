// Options 1:

import { ChangeDetectorRef, Component, computed, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Assets } from '../../assets/assets';
import { Playlist } from '../../playlist/playlist';
import { DesignLayoutService } from '../design-layout.service';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Screen } from '../../screens/screen';
import { environment } from '../../../../environments/environment.development';
import { UtilityService } from '../../../core/services/utility.service';
import { DesignEditorService } from '../design-editor.service';
import { Artboard, Design, DesignLayout, LayerItem, SelectionBox } from '../design-layout';
import { v7 as uuidv7 } from 'uuid';
import interact from 'interactjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-design-editor',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './design-editor.component.html',
  styleUrl: './design-editor.component.scss',
})
export class DesignEditorComponent {

  @ViewChild('workspace') workspaceRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewport') viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('artboard') artboardRef!: ElementRef<HTMLDivElement>

  @Input() items!: Assets | Playlist | any;

  designLayoutService = inject(DesignLayoutService);
  designEditorService = inject(DesignEditorService);
  utils = inject(UtilityService);
  
  iconPath: string = environment.iconPath;
  artboard!: Artboard;

  artboardObjects: LayerItem[] = [];

  isDragging: boolean = false;

  showContent: boolean = false;

  // Selection
  isSelection: boolean = false;
  selectionBox: { x: number, y: number, w: number, h: number } | null = null;
  multiBox: SelectionBox | null = null;
  lastAngle: number = 0;

  // Fonts
  fontSize: number = 16;

  hasUnsavedChanges!: () => boolean

  @HostListener('window:resize')
  onResize() {
    if (this.artboard) this.onFitToWrapper();
  }
  
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true
    }
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.selectedObject.valueChanges.subscribe((value: any) => {
      this.artboardObjects.filter(i => i.selected).forEach(item => {
        item.x = value.x;
        item.y = value.y;
        item.w = value.w;
        item.h = value.h;
        item.a = value.a;
      });
      this.onUpdateMultiBox();
      this.cdr.detectChanges()
    });
  }

  ngAfterViewInit() {
    this.onInitInteractBBox();
  }

  onInitInteractBBox() {
    interact('.multi-bbox, .item')
      .draggable({ listeners: { move: (event) => this.onItemMove(event) }, })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: { move: (event) => this.onItemResize(event) },
      });

    interact('.multi-bbox .rotate-handle').draggable({
      listeners: { move: (event) => this.onItemRotate(event), },
      cursorChecker: () => 'move'
    })
  }

  onArtboardFunction(event: MouseEvent) {
    if (this.isDragging) this.onStartPan(event);
    if (!this.isDragging) {
      this.onItemSelection(event);
    }
  }

  onItemRotate(event: any) {
    if (!this.multiBox) return; 
    
    const boxElement = document.querySelector('.multi-bbox');
    if (!boxElement) return;
    
    const rect = boxElement.getBoundingClientRect();
    
    // Find Center Point of multiBox
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const radians = Math.atan2(mouseY - centerY, mouseX - centerX);
    let degrees = (radians * (180 / Math.PI) + 90) % 360;
    if (degrees < 0) degrees += 360;
    
    // Incremental rotation
    const delta = degrees - this.multiBox.a;
    this.multiBox.a = degrees;

    // get group center
    const { cx, cy }: any = this.onCalculateGroupCenter();
    this.artboardObjects.filter(i => i.selected).forEach(item => {
      // get vector from item center to group center
      const itemCenterX = item.x + item.w / 2;
      const itemCenterY = item.y + item.h / 2;
      
      const dx = itemCenterX - cx;
      const dy = itemCenterY - cy;

      // Rotate the vector
      const rad = delta * Math.PI / 180;
      const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);

      // Update item position so the item rotates around group center
      item.x = cx + rotatedX - item.w / 2;
      item.y = cy + rotatedY - item.h / 2;

      // Update individual rotation if needed
      item.a = (item.a || 0) + delta;
      if (item.a < 0) item.a += 360;
      item.a %= 360;
    });

    this.onUpdateMultiBox();
  }

  onItemMove(event: any) {    
    const { scale } = this.artboard;
    if (!this.multiBox) return; 
    
    // Get Mouse Position on a scaled artboard
    const dx = event.dx / scale;
    const dy = event.dy / scale;

    this.artboardObjects.filter(i => i.selected).forEach(item => {
      item.x += dx;
      item.y += dy;
    });

    this.onUpdateMultiBox();
  }

  onItemResize(event: any) {
    const { scale } = this.artboard;
    if (!this.multiBox) return;

    // Get Mouse Position on a scaled artboard
    const deltaW = event.deltaRect.width / scale;
    const deltaH = event.deltaRect.height / scale;
    const deltaX = event.deltaRect.left / scale;
    const deltaY = event.deltaRect.top / scale;

    this.artboardObjects.filter(i => i.selected).forEach(item => {
      item.w += deltaW;
      item.h += deltaH;
      item.x += deltaX;
      item.y += deltaY;

      
      // if (item.type === 'text') {
      //   const el = document.querySelector(`[data-id="${item.id}"]`) as HTMLElement;
      //   if (!el) return;

      //   const text = el.querySelector('p') as HTMLElement;
      //   const textHeight = text.scrollHeight;
        
      //   item.h = textHeight;
      // }
    });

    this.onUpdateMultiBox();
  }
  onItemSelection(event: any) {
    const { scale } = this.artboard;
    const artboard = this.artboardRef.nativeElement;

    // Only allow when clicking the artboard itself
    if (event.target !== artboard) return;

    // Clear selection first
    this.onClearSelection();

    const rect = artboard.getBoundingClientRect();
    const startX = (event.clientX - rect.left) / scale;
    const startY = (event.clientY - rect.top) / scale;

    this.selectionBox = { x: startX, y: startY, w: 0, h: 0 };

    const move = (ev: MouseEvent) => {
      const currentX = (ev.clientX - rect.left) / scale;
      const currentY = (ev.clientY - rect.top) / scale;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const w = Math.abs(currentX - startX);
      const h = Math.abs(currentY - startY);

      this.selectionBox = { x, y, w, h };

      // Select items
      this.artboardObjects.forEach(item => {
        item.selected =
          item.x < x + w &&
          item.x + item.w > x &&
          item.y < y + h &&
          item.y + item.h > y;
      });
    };

    const stop = () => {
      this.selectionBox = null;
      this.onUpdateMultiBox();
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
  }

  onItemClick(event: MouseEvent, item: LayerItem) {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      item.selected = !item.selected;
    } else {
      this.artboardObjects.forEach(i => i.selected = false);
      item.selected = true;
      this.selectedObject.patchValue(item);
    }
    this.onUpdateMultiBox();
  }

  onClearSelection() {
    this.artboardObjects.forEach(i => i.selected = false);
    this.selectedObject.reset();
    this.onUpdateMultiBox();
  }

  onUpdateMultiBox() {
    const selected = this.artboardObjects.filter(i => i.selected);

    if (selected.length === 0) {
      this.multiBox = null;
      return;
    }

    // -------- SINGLE SELECTION --------
    if (selected.length === 1) {
      const item = selected[0];
      const x = Math.floor(item.x);
      const y = Math.floor(item.y);
      const w = Math.floor(item.w);
      const h = Math.floor(item.h);

      this.multiBox = { x, y, w, h, a: item.a || 0, cx: x + w / 2, cy: y + h / 2, };
      this.selectedObject.patchValue(this.multiBox, { emitEvent: false })
      return;
    }

    // -------- MULTI SELECTION --------
    const minX = Math.floor(Math.min(...selected.map(i => i.x)));
    const minY = Math.floor(Math.min(...selected.map(i => i.y)));
    const maxX = Math.floor(Math.max(...selected.map(i => i.x + i.w)));
    const maxY = Math.floor(Math.max(...selected.map(i => i.y + i.h)));

    const w = maxX - minX;
    const h = maxY - minY;

    this.multiBox = { x: minX, y: minY, w, h, a: this.multiBox?.a || 0, cx: minX + w / 2, cy: minY + h / 2, };
    this.selectedObject.patchValue(this.multiBox, { emitEvent: false })
  }

  onCalculateGroupCenter() {
    let sumX: number = 0;
    let sumY: number = 0;

    this.artboardObjects.filter(i => i.selected).forEach(item => {
      sumX += item.x + item.w / 2;
      sumY += item.y + item.h / 2;
    });

    const centerX = sumX / this.artboardObjects.filter(i => i.selected).length;
    const centerY = sumY / this.artboardObjects.filter(i => i.selected).length;

    return { cx: centerX, cy: centerY };
  }

  canvasSizeChange(event: Design | any) {
    if (!event) return;

    this.designForm.patchValue(event);
    const screen: Screen = event.screen;
    const [width, height]: any = screen?.displaySettings.resolution.split('x');

    const resolution = { width, height };
    this.artboard = { 
      backgroundColor: event.color,
      width: resolution.width,
      height: resolution.height,
      layers: event.layers ?? [],
      scale: 1,
      translateX: 0,
      translateY: 0,
      lastX: 0,
      lastY: 0,
      defaultX: 0,
      defaultY: 0,
      defaultScale: 1
    };

    this.cdr.detectChanges();

    this.onFitToWrapper();
  }

  onApplyTransform() {
    const artboardEl = this.artboardRef.nativeElement;
    const { scale, translateX, translateY } = this.artboard;
    artboardEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  onFitToWrapper() {
    const workspace = this.workspaceRef.nativeElement;
    const { width, height } = this.artboard;
    
    const clientWidth = workspace.clientWidth;
    const clientHeight = workspace.clientHeight;

    const scaleX = clientWidth / width;
    const scaleY = clientHeight / height;
    const newScale = Math.min(scaleX, scaleY);

    Object.assign(this.artboard, {
      scale: newScale,
      translateX: (clientWidth - width * newScale) / 2,
      translateY: (clientHeight - height * newScale) / 2,
      defaultX: (clientWidth - width * newScale) / 2,
      defaultY: (clientHeight - height * newScale) / 2,
      defaultScale: newScale
    });

    this.onApplyTransform();
  }

  onWheel(event: any) {
    if (!event.ctrlKey) return;
    event.preventDefault();

    const { scale } = this.artboard;
    const workspace = this.workspaceRef.nativeElement;
    const artboardEl = this.artboardRef.nativeElement;

    // Workspace rect
    const rect = workspace.getBoundingClientRect();

    // -----------------------------------------------
    // 1. Get the ARTBOARD center in screen coordinates
    // -----------------------------------------------
    const artRect = artboardEl.getBoundingClientRect();
    const artCenterX = artRect.left + artRect.width / 2 - rect.left;
    const artCenterY = artRect.top + artRect.height / 2 - rect.top;

    // -----------------------------------------------
    // 2. Compute zoom
    // -----------------------------------------------
    const oldScale = scale;

    const zoomFactor = 1.1;
    const direction = event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

    // -----------------------------------------------
    // 3. Get the new scale and translate
    // -----------------------------------------------
    let scaleTemp: number = scale * direction;
    let newScale: number = Math.max(0.1, Math.min(8, scaleTemp));
    const scaleRatio = Math.max(0.1, Math.min(8, newScale)) / oldScale;

    Object.assign(this.artboard, {
      scale: newScale,
      translateX: artCenterX - (artCenterX - this.artboard.translateX) * scaleRatio,
      translateY: artCenterY - (artCenterY - this.artboard.translateY) * scaleRatio
    });

    this.onApplyTransform();
  }

  onStartPan(event: MouseEvent) {
    if (!this.isDragging) return;

    const artboardEl = this.viewportRef.nativeElement;

    Object.assign(this.artboard, {
      lastX: event.clientX,
      lastY: event.clientY
    })

    const move = (ev: MouseEvent) => {
      if (!this.isDragging) return;
      artboardEl.style.cursor = 'grabbing';

      const { translateX, translateY, lastX, lastY } = this.artboard;

      Object.assign(this.artboard, {
        translateX: translateX + ev.clientX - lastX,
        translateY: translateY + ev.clientY - lastY,
        lastX: ev.clientX,
        lastY: ev.clientY
      })
      
      this.onApplyTransform();
    }

    const stop = () => {
      artboardEl.style.cursor = 'grab';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
  }

  onReset() {
    const { defaultScale, defaultX, defaultY } = this.artboard;
    Object.assign(this.artboard, {
      scale: defaultScale,
      translateX: defaultX,
      translateY: defaultY
    })
    this.onApplyTransform();
  }

  onToolbarChange(event: any) {
    const { label, value } = event;
    const artboard = this.artboardRef.nativeElement;
    this.artboardObjects.forEach(i => i.selected = false);

    switch (label) {
      case 'Text':
        const text = { type: 'text', content: { text: 'New Text', size: 24, color: '#000000' } };
        this.onSelectedContentChange(text);
        break;
      case 'Content':
        this.showContent = value;
        break;
      case 'Hand':
        artboard.style.cursor = value ? 'grab' : 'default';
        this.isDragging = value;
        break;
      case 'Select':
        this.isSelection = value;
        break;
      case 'Zoom':
        this.onReset();
        break;
      default:
        break;
    }
  }

  onTextChange(event: Event) {
    const target = event.target as HTMLInputElement;    
    this.artboardObjects.filter(i => i.selected).forEach(item => {
      if (item.type === 'text') {
        item.content.text = target.value;

        const el = document.querySelector(`[data-id="${item.id}"]`) as HTMLElement;
        if (!el) return;

        const text = el.querySelector('p') as HTMLElement;
        const textHeight = text.scrollHeight;
        
        item.h = textHeight;
      }
    });
    this.cdr.detectChanges();
    this.onUpdateMultiBox();
  }

  onSelectedContentChange(event: Assets | DesignLayout | any) {
    if (!event) return;
    let { scale } = this.artboard;
    const artboardRect = this.artboardRef.nativeElement.getBoundingClientRect();
    const randomX = Math.floor(Math.random() * (artboardRect.width / scale));
    const randomY = Math.floor(Math.random() * (artboardRect.height / scale));

    let height = 300;
    if (event.type === 'text') {
      const textElement = document.createElement('div');
      textElement.innerText = event.content.text;
      textElement.style.fontSize = `${this.fontSize}px`;
      document.body.appendChild(textElement);
      height = textElement.scrollHeight + 20;
      document.body.removeChild(textElement);
    }

    const item = {
      id: uuidv7(),
      type: event.type,
      content: event.content ?? event,
      x: randomX,
      y: randomY,
      w: 400,
      h: height,
      a: 0,
      selected: false,
      locked: false,
      hidden: false,
      zIndex: 0
    }
    this.artboardObjects.push(item);
    // this.selectedObject.patchValue(item);
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }
  
  getIconPath(name: string): string {
    return `${this.iconPath}${this.isDarkTheme ? `${name}-white.png` : `${name}.png`}`
  }
  
  hasUnsavedData(): boolean {
    return this.designForm.invalid
  }

  get designForm() {
    return this.designEditorService.designForm
  }

  get selectedObject() {
    return this.designEditorService.selectedObject
  }

  get showCanvasSize() {
    return this.designEditorService.showCanvasSize
  }

  get menuBarItems() {
    return this.designEditorService.menuBarItems;
  }

  get isDarkTheme() {
    return this.utils.isDarkTheme()
  }
}