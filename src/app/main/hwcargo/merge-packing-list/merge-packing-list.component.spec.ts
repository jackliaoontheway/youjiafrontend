import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergePackingListComponent } from './merge-packing-list.component';

describe('MergePackingListComponent', () => {
  let component: MergePackingListComponent;
  let fixture: ComponentFixture<MergePackingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergePackingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergePackingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
