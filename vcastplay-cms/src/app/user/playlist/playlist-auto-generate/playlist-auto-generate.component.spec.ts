import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistAutoGenerateComponent } from './playlist-auto-generate.component';

describe('PlaylistAutoGenerateComponent', () => {
  let component: PlaylistAutoGenerateComponent;
  let fixture: ComponentFixture<PlaylistAutoGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistAutoGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistAutoGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
