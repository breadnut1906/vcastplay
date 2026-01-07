import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSelectionComponent } from './content-selection.component';

describe('ContentSelectionComponent', () => {
  let component: ContentSelectionComponent;
  let fixture: ComponentFixture<ContentSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
