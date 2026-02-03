import { Component, computed, effect, ElementRef, inject, Input, QueryList, signal, TemplateRef, ViewChildren, } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../playlist.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AssetsService } from '../../assets/assets.service';
import { MessageService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { PlaylistItemContentComponent } from '../playlist-item-content/playlist-item-content.component';

@Component({
  selector: 'app-playlist-container',
  imports: [ PrimengUiModule, PlaylistItemContentComponent ],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.scss'
})
export class PlaylistContainerComponent {

  @Input() playlistForm!: FormGroup;
  @Input() isPlaying: boolean = false;

  @ViewChildren('playlistContent', { read: ElementRef }) playlistContent!: QueryList<ElementRef>

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  message = inject(MessageService);

  activeIndex: number = 0;

  constructor() {
    effect(() => {
      const content = this.currentPlaying;
      if (content) {
        const { entries } = this.playlistForm.value;
        const index = entries.findIndex((item: any) => item.sequence === content.sequence);
        this.activeIndex = index;
        this.onScrollContent(index);
      }
    })
  }

  ngOnInit() { }

  onScrollContent(index: number) {
    const child = this.playlistContent.toArray()[index].nativeElement as HTMLElement;
    child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  onDropped(event: CdkDragDrop<string[]>) {
    const { entries } = this.playlistForm.value;
    const { previousIndex, previousContainer, currentIndex, container, item: { data } } = event;

    // If the item is from the same container (reordering)
    if (previousContainer == container) {
      moveItemInArray(entries, previousIndex, currentIndex);
      this.playlistForm.patchValue({ entries: this.onSequenceEntries(entries) });
      return;
    }

    // Add item    
    entries.splice(currentIndex, 0, data);
    this.playlistForm.patchValue({ entries });
  }

  onSequenceEntries(entrie: any[]) {
    return entrie.map((item: any, index: number) => { return { ...item, sequence: index + 1 } });
  }

  trackByFn(index: number, item: any) { return item.sequence; }

  get entries() { return this.playlistForm.get('entries'); }
  get currentPlaying() { return this.playlistService.currentPlaying(); }
}
