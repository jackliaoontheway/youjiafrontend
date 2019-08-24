import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { TableDialogComponent } from 'app/model-view/component/table-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ModelService } from 'app/service/model.service';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-add-user-to-user-group',
  templateUrl: './add-user-to-user-group.component.html',
  styleUrls: ['./add-user-to-user-group.component.scss']
})
export class AddUserToUserGroupComponent implements OnInit {

  userAccountLoginNameInput: FormControl;

  userGroupId: number;
  serviceUrl: string;
  methodUrl: string;
  modelTitle: string;
  matDialogRef: MatDialogRef<TableDialogComponent>;

  constructor(private matDialogRef_: MatDialogRef<TableDialogComponent>, private translate: TranslateService,
    private _modelService: ModelService, @Inject(MAT_DIALOG_DATA) private data: any, public snackBar: MatSnackBar) {
    this.matDialogRef = matDialogRef_;
    this.modelTitle = data.modelTitle;
    this.serviceUrl = data.serviceUrl;
    this.methodUrl = data.methodUrl;
    this.userGroupId = data.userGroupId;
  }

  ngOnInit(): void {
    this.userAccountLoginNameInput = new FormControl('');
  }

  onSubmit(): void {
    const requestData = {
      id : null,
      label : null
    };
    requestData.id = this.userGroupId;
    requestData.label = this.userAccountLoginNameInput.value;

    this._modelService.saveEntityByCriteria(this.serviceUrl, this.methodUrl, requestData)
      .then(responseData => {
        if (responseData) {
          this.matDialogRef.close();
          this.openSnackBar('Succussfully', 'OK');
        }
    });
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  
}
