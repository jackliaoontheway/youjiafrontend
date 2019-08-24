import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModelService } from 'app/service/model.service';
import { MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-search-mawb-packing-list',
  templateUrl: './search-mawb-packing-list.component.html',
  styleUrls: ['./search-mawb-packing-list.component.scss']
})
export class SearchMawbPackingListComponent implements OnInit {

  orderNumInput: FormControl;
  mawb: string;
  hawb: string;
  three8Number: string;

  constructor(private translate: TranslateService, private _modelService: ModelService
    , public snackBar: MatSnackBar, private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this.orderNumInput = new FormControl('');
    this.mawb = '';
    this.hawb = '';
    this.three8Number = '';
  }

  onSearchKeyPress(event: any, searchElm: any): void {
    const manifestData = {packingListNo: ''};
    manifestData.packingListNo = this.orderNumInput.value;
    this._modelService.fetchEntitiesByCriteria('/manifestdatas/', 'fetchByPlNumber', manifestData).then(responseData => {
      if (responseData) {
        this.mawb = responseData[0].mawb;
        this.hawb = responseData[0].hawb;
        this.three8Number = responseData[0].three8Number;
        this.orderNumInput.setValue(null);
      } else {
        this.mawb = '';
        this.hawb = '';
        this.three8Number = '';
        this.orderNumInput.setValue(null);
        this.openSnackBar(this.translate.instant('search-packinglist-nodata'), 'Error');
      }
    });
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
