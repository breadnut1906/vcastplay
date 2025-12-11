import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core'
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module'
import { DesignLayoutService } from '../design-layout.service'
import { UtilityService } from '../../../core/services/utility.service'
import { ComponentsModule } from '../../../core/modules/components/components.module'
import { ScreenSelectionComponent } from '../screen-selection/screen-selection.component'
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api'
import { Router } from '@angular/router'
import { PlaylistService } from '../../playlist/playlist.service'
import { CdkDrag } from '@angular/cdk/drag-drop'
import { Assets } from '../../assets/assets'
import { DesignLayout } from '../design-layout'

@Component({
  selector: 'app-design-layout-details',
  imports: [PrimengUiModule, ComponentsModule ],
  templateUrl: './design-layout-details.component.html',
  styleUrl: './design-layout-details.component.scss',
})
export class DesignLayoutDetailsComponent {
  @ViewChild('screen') screenElement!: ScreenSelectionComponent

  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>

  @ViewChild('importFile') importFileElement!: ElementRef<HTMLInputElement>
  @ViewChild(CdkDrag) cdkDrag!: CdkDrag

  router = inject(Router)

  designLayoutService = inject(DesignLayoutService)
  playlistService = inject(PlaylistService)
  utils = inject(UtilityService)
  confirmation = inject(ConfirmationService)
  message = inject(MessageService)

  showInfo = signal<boolean>(false)
  layoutItems: MenuItem[] = [
    {
      label: 'File',
      icon: 'pi pi-file',
      items: [
        {
          label: 'New',
          command: () => this.showCanvasSize.set(true),
          disabled: false,
          shortcut: 'Alt+Ctrl+N',
        },
        {
          label: 'Save',
          command: (event: any) => this.onClickSaveDesign(event),
          disabled: true,
          shortcut: 'Ctrl+S',
        },
        { separator: true },
        { label: 'Import', command: () => this.onClickImportCanvas() },
        { label: 'Export', command: () => this.onClickExportCanvas(), disabled: true },
        { label: 'Info', command: () => this.showInfo.set(true), disabled: true },
        { separator: true },
        {
          label: 'Exit',
          command: () => this.router.navigate(['/layout/design-layout-library']),
        },
      ],
    },
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      items: [
        {
          label: 'Undo',
          command: () => this.onClickUndoLayer(),
          disabled: true,
          shortcut: 'Ctrl+Z',
        },
        {
          label: 'Redo',
          command: () => this.onClickRedoLayer(),
          disabled: true,
          shortcut: 'Ctrl+Y',
        },
        {
          label: 'Select All',
          command: () => this.onClickSelectAllLayers(),
          disabled: true,
          shortcut: 'Ctrl+A',
        },
        { separator: true },
        {
          label: 'Cut',
          command: () => this.onClickCutLayer(),
          disabled: true,
          shortcut: 'Ctrl+X',
        },
        {
          label: 'Copy',
          command: () => this.onClickCopyLayer(),
          disabled: true,
          shortcut: 'Ctrl+C',
        },
        {
          label: 'Paste',
          command: () => this.onClickPasteLayer(),
          disabled: true,
          shortcut: 'Ctrl+V',
        },
      ],
    },
    {
      label: 'Layers',
      icon: 'pi pi-th-large',
      items: [
        {
          label: 'New Layer',
          childIcon: 'pi pi-chevron-right',
          items: [
            {
              label: 'Text',
              command: () => this.onClickAddLayer('text'),
              disabled: false,
            },
            {
              label: 'Line',
              command: () => this.onClickAddLayer('line'),
              disabled: false,
            },
            {
              label: 'Contents',
              command: () => this.onClickAddLayer('content'),
              disabled: false,
            },
            {
              label: 'Shapes',
              childIcon: 'pi pi-chevron-right',
              items: [
                {
                  label: 'Circle',
                  command: () => this.onClickAddShape('circle'),
                  disabled: false,
                },
                {
                  label: 'Rectangle',
                  command: () => this.onClickAddShape('rectangle'),
                  disabled: false,
                },
                {
                  label: 'Triangle',
                  command: () => this.onClickAddShape('triangle'),
                  disabled: false,
                },
                {
                  label: 'Ellipse',
                  command: () => this.onClickAddShape('ellipse'),
                  disabled: false,
                },
              ],
            },
          ],
          disabled: true,
        },
        {
          label: 'Duplicate',
          command: () => this.onClickDuplicateLayer(),
          disabled: true,
          shortcut: 'Ctrl+D',
        },
        {
          label: 'Delete',
          command: () => this.onClickRemoveLayer(),
          disabled: true,
          shortcut: 'Del',
        },
        { separator: true },
        {
          label: 'Arrange',
          childIcon: 'pi pi-chevron-right',
          items: [
            {
              label: 'Bring to Front',
              command: () => this.onClickLayerArrangement('front'),
              disabled: false,
            },
            {
              label: 'Send to Back',
              command: () => this.onClickLayerArrangement('back'),
              disabled: false,
            },
            {
              label: 'Bring Forward',
              command: () => this.onClickLayerArrangement('forward'),
              disabled: false,
            },
            {
              label: 'Send Backward',
              command: () => this.onClickLayerArrangement('backward'),
              disabled: false,
            },
          ],
          disabled: true,
        },
        {
          label: 'Layer Position',
          childIcon: 'pi pi-chevron-right',
          items: [
            {
              label: 'Lock',
              command: () => this.onClickLayerLock(true),
            },
            {
              label: 'Unlock',
              command: () => this.onClickLayerLock(false),
            },
          ],
          disabled: true,
        }
      ],
    },
  ]

  objectAlignments: any[] = [
    {
      label: 'Align Left',
      command: () => this.onClickLayerAlignment('left'),
      image: 'assets/icons/align-left.png',
      darkImage: 'assets/icons/align-left-white.png',
    },
    {
      label: 'Align Center',
      command: () => this.onClickLayerAlignment('center'),
      image: 'assets/icons/align-center.png',
      darkImage: 'assets/icons/align-center-white.png',
    },
    {
      label: 'Align Right',
      command: () => this.onClickLayerAlignment('right'),
      image: 'assets/icons/align-right.png',
      darkImage: 'assets/icons/align-right-white.png',
    },
    {
      label: 'Spacing Center',
      command: () => this.onClickLayerSpacing('horizontal'),
      image: 'assets/icons/spacing-center.png',
      darkImage: 'assets/icons/spacing-center-white.png',
    },
    {
      label: 'Align Top',
      command: () => this.onClickLayerAlignment('top'),
      image: 'assets/icons/align-top.png',
      darkImage: 'assets/icons/align-top-white.png',
    },
    {
      label: 'Align Middle',
      command: () => this.onClickLayerAlignment('middle'),
      image: 'assets/icons/align-middle.png',
      darkImage: 'assets/icons/align-middle-white.png',
    },
    {
      label: 'Align Bottom',
      command: () => this.onClickLayerAlignment('bottom'),
      image: 'assets/icons/align-bottom.png',
      darkImage: 'assets/icons/align-bottom-white.png',
    },
    {
      label: 'Spacing Middle',
      command: () => this.onClickLayerSpacing('vertical'),
      image: 'assets/icons/spacing-middle.png',
      darkImage: 'assets/icons/spacing-middle-white.png',
    },
  ]

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'n') {
      event.preventDefault()
      event.stopPropagation()
      this.showCanvasSize.set(true)
    }

    // Copy
    if (event.key === 'c' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickCopyLayer()
    }

    // Cut
    if (event.key === 'x' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickCutLayer()
    }

    // Paste
    if (event.key === 'v' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickPasteLayer()
    }

    //Delete
    if (event.key === 'Delete' && !this.showCanvasSize()) this.onClickRemoveLayer()

    //Duplicate
    if (event.key === 'd' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickDuplicateLayer()
    }

    //Select All
    if (event.key === 'a' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickSelectAllLayers()
    }

    // Undo
    if (event.key === 'z' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickUndoLayer()
    }

    // Redo
    if (event.key === 'y' && event.ctrlKey && !this.showCanvasSize()) {
      event.preventDefault()
      event.stopPropagation()
      this.onClickRedoLayer()
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onScaleCanvas(
      canvas,
      this.viewport.nativeElement,
      this.canvasContainer.nativeElement
    )
  }

  hasUnsavedChanges!: () => boolean

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.designLayoutService.onGetDesigns()
  }

  ngOnChanges() {}

  ngOnDestroy() {
    this.isEditMode.set(false)
    this.designLayoutService.onSetCanvasProps('exit', false, 'default')
    this.designLayoutService.onExitCanvas()
    const canvasElement = document.querySelector('canvas');
    canvasElement?.remove();
  }

  ngAfterViewInit() {
    if (this.isEditMode()) {
      this.designLayoutService.onEditDesign(
        this.viewport.nativeElement,
        this.canvasContainer.nativeElement,
        this.designForm.value
      )
      this.onUpdateMenus()
    }
  }

  hasUnsavedData(): boolean {
    return this.designForm.invalid
  }

  onClickCreateCanvas() {
    const { screen, color } = this.designForm.value
    const [width, height]: any = screen.displaySettings.resolution.split('x')
    this.designLayoutService.onCreateCanvas(
      this.viewport.nativeElement,
      this.canvasContainer.nativeElement,
      { width, height },
      color
    )
    this.showCanvasSize.set(false)
    this.screenElement.selectedScreen.set(null)
    this.onUpdateMenus()
  }

  onClickSaveDesign(event: Event) {
    if (this.designForm.invalid) return

    const canvas = this.designLayoutService.getCanvas()
    if (!canvas) return

    const objects: any[] = canvas.getObjects()
    if (objects.length === 0) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please add at least one layer to the design',
      })
      return
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      header: 'Confirm Save',
      icon: 'pi pi-question-circle',
      acceptButtonProps: { label: 'Save' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Design saved successfully!',
        })
        this.designLayoutService.onSaveDesign(
          this.canvasContainer.nativeElement,
          this.designForm.value
        )
        this.router.navigate(['/layout/design-layout-library'])
      },
    })
  }

  onClickAddLayer(type: string) {
    const canvas = this.designLayoutService.getCanvas()
    switch (type) {
      case 'text':
        this.designLayoutService.onAddTextToCanvas(canvas, 'Enter text here', this.selectedColor())
        break
      case 'line':
        this.designLayoutService.onAddLineToCanvas(canvas, this.selectedColor())
        break
      default:
        this.showContents.set(true)
        break
    }
    // this.onResetCanvasPosition();
    this.designLayoutService.onMoveObjectToPosition('front')
  }

  onClickAddShape(type: string) {
    const canvas = this.designLayoutService.getCanvas()
    // this.onResetCanvasPosition();
    this.designLayoutService.onAddShapeToCanvas(canvas, type, this.selectedColor())
  }

  onClickCloseCanvasSize() {
    this.showCanvasSize.set(false)
    this.designForm.reset()
  }

  onClickZoom(zoomIn: boolean) {
    const factor = zoomIn ? 1.2 : 0.8
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onZoomCanvas(canvas, this.canvasContainer.nativeElement, factor, false)
  }

  onClickResetZoom() {
    this.onResetCanvasPosition()
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onZoomCanvas(canvas, this.canvasContainer.nativeElement, 1, true)
  }

  onClickLayerArrangement(position: 'forward' | 'backward' | 'front' | 'back') {
    // this.onResetCanvasPosition();
    this.designLayoutService.onMoveObjectToPosition(position)
  }

  onClickLayerAlignment(position: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    // this.onResetCanvasPosition();
    this.designLayoutService.onLayerAlignment(position)
  }

  onClickLayerSpacing(axis: 'horizontal' | 'vertical') {
    // this.onResetCanvasPosition();
    this.designLayoutService.onLayerSpacing(axis)
  }

  onClickCopyLayer() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onCopyLayers(canvas)
  }

  onClickCutLayer() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onCutLayers(canvas)
  }

  onClickPasteLayer() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onPasteLayers(canvas)
  }

  onClickDuplicateLayer() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onDuplicateLayer(canvas)
  }

  onClickSelectAllLayers() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onSelectAllLayers(canvas)
  }

  onClickRemoveLayer() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onRemoveLayer(canvas)
  }

  onClickUndoLayer() {
    this.designLayoutService.onUndoLayer()
  }

  onClickRedoLayer() {
    this.designLayoutService.onRedoLayer()
  }

  onClickExportCanvas() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onExportCanvas(canvas)
  }

  onClickImportCanvas() {
    this.importFileElement.nativeElement.click()
  }

  onClickLayerLock(value: boolean) {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onLayerLock(canvas, value)
  }

  onSelectionChange(event: any) {
    if (!event) {
      this.designForm.patchValue({ screen: null })
      return
    }
    this.designForm.patchValue({ screen: event })
  }

  onClickAddMarquee() {
    const value = this.marqueeControl.value
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onAddTextMarquee(canvas, value, this.selectedColor())
    this.marqueeControl.reset()
    this.showInputMarquee.set(false)
  }

  onSelectedContentChange(event: Assets | DesignLayout | any) {
    const { loop, type, ...info }: any = event
    const canvas = this.designLayoutService.getCanvas()
    const { files } = this.designForm.value
    const fileExists = files.some((file: Assets) => file.id === event.id && file.url === event.url)
    switch (type) {
      case 'image':
      case 'clipart':
        this.designLayoutService.onAddImageToCanvas(canvas, event)
        if (fileExists) break;
        
        this.designForm.patchValue({
          files: [...files, { id: event.id, name: event.name, url: event.url }],
        })
        break
      case 'playlist':
        this.designLayoutService.onAddHTMLToCanvas(canvas, { loop: true, type, ...info })
        if (fileExists) break;
        this.designForm.patchValue({ files: [...files, ...event.files] })
        break
      case 'youtube':
      case 'facebook':
      case 'web':
        this.designLayoutService.onAddHTMLToCanvas(canvas, { loop: true, type, ...info })
        if (fileExists) break;
        this.designForm.patchValue({
          files: [...files, { id: event.id, name: event.name, link: event.link }],
        })
        break
      default:
        this.designLayoutService.onAddVideoToCanvas(canvas, event)
        if (fileExists) break;
        this.designForm.patchValue({
          files: [...files, { id: event.id, name: event.name, link: event.link }],
        })
        break
    }
  }

  onUpdateMenus() {
    this.layoutItems.forEach((menu) => {
      const items = menu.items
      if (items) {
        items.forEach((item: any) => {
          if (['New', 'Export'].includes(item.label)) item.disabled = !this.isEditMode()
          else item.disabled = false
        })
      }
    })
  }

  onImportFile(event: any) {
    this.isEditMode.set(true)
    this.designLayoutService.onImportCanvas(
      event,
      this.viewport.nativeElement,
      this.canvasContainer.nativeElement
    )
    this.onUpdateMenus()
  }

  onZoomChange(event: any) {
    const { value } = event
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onZoomCanvas(canvas, this.canvasContainer.nativeElement, value, false)
  }

  onResetCanvasPosition() {
    // this.cdkDrag.reset();
  }

  onShowGridLinesChange(event: any) {
    const { checked } = event    
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onShowGridLines(canvas, checked)
  }

  trackById(index: number, item: any) {
    return item.id // unique ID
  }

  get isEditMode() {
    return this.designLayoutService.isEditMode
  }
  get designForm() {
    return this.designLayoutService.designForm
  }
  get canvasProps() {
    return this.designLayoutService.canvasProps
  }
  get zoomControl() {
    return this.designLayoutService.zoomControl
  }
  get showContents() {
    return this.designLayoutService.showContents
  }
  get selectedColor() {
    return this.designLayoutService.selectedColor
  }
  get DEFAULT_SCALE() {
    return this.designLayoutService.DEFAULT_SCALE
  }
  get showCanvasSize() {
    return this.designLayoutService.showCanvasSize
  }
  get marqueeControl() {
    return this.designLayoutService.marqueeControl
  }
  get designFormValue() {
    return this.designLayoutService.designForm.value
  }
  get showInputMarquee() {
    return this.designLayoutService.showInputMarquee
  }

  get showGridLines() {
    return this.designLayoutService.showGridLines
  }

  get colors() {
    return this.utils.colors
  }

  get isMobile() {
    return this.utils.isMobile()
  }
  get isTablet() {
    return this.utils.isTablet()
  }

  get isDarkTheme() {
    return this.utils.isDarkTheme()
  }

  get htmlLayers() {
    return this.designForm.get('htmlLayers')
  }
}
