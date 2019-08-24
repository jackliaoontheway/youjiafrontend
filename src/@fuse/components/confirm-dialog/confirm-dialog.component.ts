import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'fuse-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class FuseConfirmDialogComponent implements OnInit {
    public confirmTitle: string;
    public confirmMessage: string;
    confirm: string;
    cancel: string;

    constructor(
        public dialogRef: MatDialogRef<FuseConfirmDialogComponent>,
        private _translate: TranslateService
    ) {
    }

    ngOnInit(): void {
        this.confirm = this._translate.instant('Model.label.confirm');
        this.cancel = this._translate.instant('Model.label.cancel');
    }
}
