import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMawbPackingListComponent } from './search-mawb-packing-list.component';

describe('SearchMawbPackingListComponent', () => {
  let component: SearchMawbPackingListComponent;
  let fixture: ComponentFixture<SearchMawbPackingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchMawbPackingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMawbPackingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
