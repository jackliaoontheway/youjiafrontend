import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToUserGroupComponent } from './add-user-to-user-group.component';

describe('AddUserToUserGroupComponent', () => {
  let component: AddUserToUserGroupComponent;
  let fixture: ComponentFixture<AddUserToUserGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserToUserGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserToUserGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
