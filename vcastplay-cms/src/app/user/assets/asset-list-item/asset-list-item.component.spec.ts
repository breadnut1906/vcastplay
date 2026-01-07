import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetListItemComponent } from './asset-list-item.component';

describe('AssetListItemComponent', () => {
  let component: AssetListItemComponent;
  let fixture: ComponentFixture<AssetListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
