import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurvivorsComponent } from './survivors.component';

describe('SurvivorsComponent', () => {
  let component: SurvivorsComponent;
  let fixture: ComponentFixture<SurvivorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurvivorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurvivorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
