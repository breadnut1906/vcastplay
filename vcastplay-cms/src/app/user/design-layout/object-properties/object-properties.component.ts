import { Component, inject, Input, signal } from '@angular/core'
import { UtilityService } from '../../../core/services/utility.service'
import { DesignLayoutService } from '../design-layout.service'
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module'
import { MenuItem } from 'primeng/api'
import { environment } from '../../../../environments/environment.development'

@Component({
  selector: 'app-object-properties',
  imports: [PrimengUiModule],
  templateUrl: './object-properties.component.html',
  styleUrl: './object-properties.component.scss',
})
export class ObjectPropertiesComponent {
  @Input() propsType!: string

  iconPath: string = environment.iconPath

  designlayoutService = inject(DesignLayoutService)
  utils = inject(UtilityService)

  isBold = signal<boolean>(false)
  isItalic = signal<boolean>(false)
  isUnderline = signal<boolean>(false)

  isTransparent = signal<boolean>(false)
  rectPropOptions: MenuItem[] = [
    { label: 'Fill', value: 'fill' },
    { label: 'Outlined', value: 'outline' },
    { label: 'Dashed', value: 'dashed' },
  ]

  alignmentOptions: MenuItem[] = [
    { icon: 'pi pi-align-left', value: 'left' },
    { icon: 'pi pi-align-center', value: 'center' },
    { icon: 'pi pi-align-right', value: 'right' },
    { icon: 'pi pi-align-justify', value: 'justify' },
  ]

  constructor() {
    this.objectPropsForm.valueChanges.subscribe((value) => {      
      const canvas = this.designlayoutService.getCanvas()
      switch (this.propsType) {
        case 'text':
          this.isBold.set(value.weight)
          this.isItalic.set(value.italic)
          this.isUnderline.set(value.underline)
          this.designlayoutService.onUpdateTextProperty(canvas, value)
          break
        case 'rect':
          this.designlayoutService.onUpdateRectProperty(canvas, value)
          break
        case 'line':
          this.designlayoutService.onUpdateLineProperty(canvas, value)
          break
        case 'marquee':
          this.isBold.set(value.weight)
          this.isItalic.set(value.italic)
          this.isUnderline.set(value.underline)
          this.designlayoutService.onUpdateMarqueeProperty(canvas, value)
          break
      }
    })
  }

  getIconPath(name: string): string {
    return `${this.iconPath}${this.isDarkTheme ? `${name}-white.png` : `${name}.png`}`
  }

  onClickTransparent() {
    this.isTransparent.set(!this.isTransparent())
    this.objectPropsForm.patchValue({ transparent: this.isTransparent() })
  }

  onClickBold() {
    const { weight } = this.objectPropsForm.value
    this.objectPropsForm.patchValue({ weight: !weight })
  }

  onClickItalic() {
    const { italic } = this.objectPropsForm.value
    this.objectPropsForm.patchValue({ italic: !italic })
  }

  onClickUnderline() {
    const { underline } = this.objectPropsForm.value
    this.objectPropsForm.patchValue({ underline: !underline })
  }

  get fontOptions() {
    return this.utils.fontOptions
  }
  get isDarkTheme() {
    return this.utils.isDarkTheme()
  }
  get objectPropsForm() {
    return this.designlayoutService.objectPropsForm
  }
  get strokeWidth() {
    return this.objectPropsForm.get('strokeWidth')
  }
  get style() {
    return this.objectPropsForm.get('style')
  }
}
