/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SessionConfigComponent } from './session-config.component';

describe('SessionConfigComponent', () => {
  let component: SessionConfigComponent;
  let fixture: ComponentFixture<SessionConfigComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ SessionConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
