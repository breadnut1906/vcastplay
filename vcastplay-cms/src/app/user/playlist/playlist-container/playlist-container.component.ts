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
        const { contents } = this.playlistForm.value;
        const index = contents.findIndex((item: any) => item.contentId === content.contentId);
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
    const { contents } = this.playlistForm.value;
    const length = contents.length || 0;
    const { previousIndex, previousContainer, currentIndex, container, item: { data } } = event;

    // If the item is from the same container (reordering)
    if (previousContainer == container) {
      moveItemInArray(contents, previousIndex, currentIndex);
      this.playlistForm.patchValue({ contents });
      return;
    }

    // Add item    
    contents.splice(currentIndex, 0, {...data, contentId: length + 1});
    this.playlistForm.patchValue({ contents });
  }

  trackByFn(index: number, item: any) { return item.contentId; }

  get contents() { return this.playlistForm.get('contents'); }
  get currentPlaying() { return this.playlistService.currentPlaying(); }
}
