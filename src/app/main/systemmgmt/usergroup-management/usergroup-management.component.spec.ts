import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsergroupManagementComponent } from './usergroup-management.component';

describe('UsergroupManagementComponent', () => {
  let component: UsergroupManagementComponent;
  let fixture: ComponentFixture<UsergroupManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsergroupManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsergroupManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
