import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TbluserComponent } from './tbluser.component';

describe('TbluserComponent', () => {
  let component: TbluserComponent;
  let fixture: ComponentFixture<TbluserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TbluserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TbluserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
