import { Component, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core'
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module'
import { DesignLayoutService } from '../design-layout.service'
import { MenuItem } from 'primeng/api'
import { UtilityService } from '../../../core/services/utility.service'
import { environment } from '../../../../environments/environment.development'

@Component({
  selector: 'app-design-layout-tools',
  imports: [PrimengUiModule],
  templateUrl: './design-layout-tools.component.html',
  styleUrl: './design-layout-tools.component.scss',
})
export class DesignLayoutToolsComponent {
  @ViewChild('textMenu') textMenu: any
  @ViewChild('shapeMenu') shapeMenu: any

  @Output() resetDragPosition = new EventEmitter<void>()

  iconPath: string = environment.iconPath;

  designLayoutService = inject(DesignLayoutService)
  utils = inject(UtilityService)

  shapeItems: MenuItem[] = [
    {
      label: 'Circle',
      command: () => this.onClickAddShape('circle'),
    },
    {
      label: 'Rectangle',
      command: () => this.onClickAddShape('rectangle'),
    },
    {
      label: 'Triangle',
      command: () => this.onClickAddShape('triangle'),
    },
    {
      label: 'Ellipse',
      command: () => this.onClickAddShape('ellipse'),
    },
  ]

  textItems: MenuItem[] = [
    { label: 'Text', command: () => this.onClickAddText() },
    { label: 'Marquee', command: () => this.onClickTextMarquee() },
  ]

  getIconPath(name: string): string {
    return `${this.iconPath}${this.isDarkTheme ? `${name}-white.png` : `${name}.png`}`
  }

  onClickSelection() {
    const canvas = this.designLayoutService.getCanvas()
    this.resetDragPosition.emit()
    this.designLayoutService.onSelection(canvas)
  }

  onClickAddText() {
    const canvas = this.designLayoutService.getCanvas()
    this.resetDragPosition.emit()
    this.designLayoutService.onAddTextToCanvas(canvas, 'Enter text here', this.selectedColor())
  }

  onClickAddShape(type: string) {
    const canvas = this.designLayoutService.getCanvas()
    this.resetDragPosition.emit()
    this.designLayoutService.onAddShapeToCanvas(canvas, type, this.selectedColor())
  }

  onClickAddContents() {
    this.resetDragPosition.emit()
    this.showContents.set(!this.showContents())
    this.designLayoutService.onSetCanvasProps('content', false, 'default')
  }

  onClickAddLine() {
    const canvas = this.designLayoutService.getCanvas()
    this.resetDragPosition.emit()
    this.designLayoutService.onAddLineToCanvas(canvas, this.selectedColor())
  }

  onClickPan() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onPan(canvas)
  }

  onClickMove() {
    this.resetDragPosition.emit()
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onMove(canvas)
  }

  onClickZoom() {
    this.resetDragPosition.emit()
    const canvas = this.designLayoutService.getCanvas()
    this.zoomControl.patchValue(canvas.getZoom())
    canvas.discardActiveObject()
    this.designLayoutService.onSetCanvasProps('zoom', true, 'default')
  }

  onClickTextMarquee() {
    this.showInputMarquee.set(true)
  }

  onUnSelectAllLayers() {
    const canvas = this.designLayoutService.getCanvas()
    this.designLayoutService.onUnSelectAllLayers(canvas)
  }

  onChangeColor(event: any) {
    this.designLayoutService.onChangeColor(event.value)
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
  get objectPropsForm() {
    return this.designLayoutService.objectPropsForm
  }
  get showInputMarquee() {
    return this.designLayoutService.showInputMarquee
  }

  get isDarkTheme() {
    return this.utils.isDarkTheme()
  }
}
