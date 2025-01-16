/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SessionsComponent } from './sessions.component';

describe('SessionListComponent', () => {
  let component: SessionsComponent;
  let fixture: ComponentFixture<SessionsComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ SessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
