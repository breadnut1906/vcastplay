import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudienceTagFiltersComponent } from './audience-tag-filters.component';

describe('AudienceTagFiltersComponent', () => {
  let component: AudienceTagFiltersComponent;
  let fixture: ComponentFixture<AudienceTagFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudienceTagFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudienceTagFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
