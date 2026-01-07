import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Assets } from '../assets/assets';
import { DesignLayout, LayerItem } from './design-layout';
import { ApprovedInfo } from '../../shared/interfaces/general';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DesignEditorService {

  designForm: FormGroup = new FormGroup({
    id: new FormControl<number>(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
    type: new FormControl<string>('design', { nonNullable: true }),
    layers: new FormControl<LayerItem[]>([], { nonNullable: true , validators: [ Validators.required ] }),
    thumbnail: new FormControl<string | null>(null),
    duration: new FormControl<number>(0),
    color: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
    approvedInfo: new FormControl<ApprovedInfo | null>(null),
    isActive: new FormControl<boolean>(false),
    screen: new FormControl<Screen | null>(null, [ Validators.required ]),
    contentId: new FormControl<any | null>(null),
    createdOn: new FormControl<Date>(moment().toDate()),
    updatedOn: new FormControl<Date>(moment().toDate()),
  });

  selectedObject: FormGroup = new FormGroup({
    x: new FormControl(0),
    y: new FormControl(0),
    w: new FormControl(0),
    h: new FormControl(0),
    a: new FormControl(0),
    content: new FormGroup({
      text: new FormControl<string>(''),
      size: new FormControl(0),
      color: new FormControl<string>(''),
      bold: new FormControl<boolean>(false),
      italic: new FormControl<boolean>(false),
      underline: new FormControl<boolean>(false),
      fontFamily: new FormControl<string>(''),
      align: new FormControl<string>(''),
      url: new FormControl<string>(''),
    }),
    backgroundColor: new FormControl<string>(''),
    borderColor: new FormControl<string>(''),
    borderWidth: new FormControl(0),
    borderRadius: new FormControl(0),
    opacity: new FormControl(0),
    locked: new FormControl<boolean>(false),
    hidden: new FormControl<boolean>(false),
    zIndex: new FormControl(0),
  })

  menuBarItems: MenuItem[] = [
    { 
      label: 'File',
      items: [
        { label: 'New', command: () => this.showCanvasSize.set(true) },
        { label: 'Open' },
        { label: 'Save' }
      ]
    }
  ]

  showCanvasSize = signal<boolean>(false);

  constructor() { }
}
