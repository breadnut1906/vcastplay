import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenBroadcastMessageComponent } from './screen-broadcast-message.component';

describe('ScreenBroadcastMessageComponent', () => {
  let component: ScreenBroadcastMessageComponent;
  let fixture: ComponentFixture<ScreenBroadcastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenBroadcastMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenBroadcastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
