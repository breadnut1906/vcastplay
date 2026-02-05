import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AudienceTagFiltersComponent } from '../../../shared/components/audience-tag-filters/audience-tag-filters.component';
import { FormBuilder, Validators } from '@angular/forms';
import { PlaylistPlayerComponent } from '../playlist-player/playlist-player.component';

@Component({
  selector: 'app-playlist-auto-generate',
  imports: [ PrimengUiModule, AudienceTagFiltersComponent, PlaylistPlayerComponent ],
  templateUrl: './playlist-auto-generate.component.html',
  styleUrl: './playlist-auto-generate.component.scss'
})
export class PlaylistAutoGenerateComponent {

  @Input() dialog = signal<boolean>(false);

  @Output() onAutoGenerateChange = new EventEmitter<any>();

  activeStep: number = 1;

  formBuilder = inject(FormBuilder);
  audienceTagForm = this.formBuilder.group({
    categoryId: [''],
    subCategoryId: [''],
    audienceTags: [''],
  });

  playlistForm = this.formBuilder.group({
    name: ['New Playlist', Validators.required],
    description: ['Test Playlists', Validators.required],
    isAuto: [true],
    isLoop: [true],
    isBlackGap: [false],
    transition: ['fade'],
    transitionSpeed: [0],
    entries: [[], Validators.required],
  });

  onAudienceTagChange(event: any) {
    this.audienceTagForm.patchValue({ audienceTags: event });
  }

  onNextStep() {
    this.activeStep++;
  }

  onPreviousStep() {
    this.activeStep--;
  }
}
