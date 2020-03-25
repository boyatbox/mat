import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TbluseractivityComponent } from './tbluseractivity.component';

describe('TbluseractivityComponent', () => {
  let component: TbluseractivityComponent;
  let fixture: ComponentFixture<TbluseractivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbluseractivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbluseractivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
