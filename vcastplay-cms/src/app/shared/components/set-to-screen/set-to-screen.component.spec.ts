import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetToScreenComponent } from './set-to-screen.component';

describe('SetToScreenComponent', () => {
  let component: SetToScreenComponent;
  let fixture: ComponentFixture<SetToScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetToScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetToScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
