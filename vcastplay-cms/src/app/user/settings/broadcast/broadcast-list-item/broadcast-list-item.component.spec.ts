import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastListItemComponent } from './broadcast-list-item.component';

describe('BroadcastListItemComponent', () => {
  let component: BroadcastListItemComponent;
  let fixture: ComponentFixture<BroadcastListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
