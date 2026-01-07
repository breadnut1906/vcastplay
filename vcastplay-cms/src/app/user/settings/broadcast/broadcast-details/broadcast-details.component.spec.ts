import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastDetailsComponent } from './broadcast-details.component';

describe('BroadcastDetailsComponent', () => {
  let component: BroadcastDetailsComponent;
  let fixture: ComponentFixture<BroadcastDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
