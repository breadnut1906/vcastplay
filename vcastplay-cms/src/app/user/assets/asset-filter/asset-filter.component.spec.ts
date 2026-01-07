import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetFilterComponent } from './asset-filter.component';

describe('AssetFilterComponent', () => {
  let component: AssetFilterComponent;
  let fixture: ComponentFixture<AssetFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
