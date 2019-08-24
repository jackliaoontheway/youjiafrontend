import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from 'app/message/message.component';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    // 配置 MatSnackBar 属性
    actionButtonLabel = '确定';
    action = false;
    autoHide = 8000;
    messageBoxOpened = false;
    msgDialogRef: MatDialogRef<MessageComponent>;
    messageBoxConfig = {
        width: '450px',
        disableClose: true,
        data: { title: 'Information', content: '', messageStyle: '', buttonBG: '' }
    };
    barConfig: MatSnackBarConfig = {
        duration: this.autoHide,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
    };

    constructor(public dialogService: MatDialog, private _snackBar: MatSnackBar) {
    }

    information(content: string): void {
        this.messageBoxConfig.data.content = content;
        this.messageBoxConfig.data.messageStyle = 'accent-300-fg';
        this.messageBoxConfig.data.buttonBG = 'mat-button accent-300-bg primary-50-fg';
        this._openMessageBox();
    }

    private _openMessageBox(): void {
        if (!this.messageBoxOpened) {
            this.messageBoxOpened = true;
            this.msgDialogRef = this.dialogService.open(MessageComponent, this.messageBoxConfig);
            this.msgDialogRef.afterClosed().subscribe(() => this.messageBoxOpened = false);
        }
    }
    error(content: string): void {
        this.messageBoxConfig.data.content = content;
        this.messageBoxConfig.data.messageStyle = 'red-500-fg';
        this.messageBoxConfig.data.buttonBG = 'mat-button red-500-bg primary-50-fg';
        this._openMessageBox();
    }

    warning(content: string): void {
        this.messageBoxConfig.data.content = content;
        this.messageBoxConfig.data.messageStyle = 'yellow-400-fg';
        this.messageBoxConfig.data.buttonBG = 'mat-button yellow-400-bg primary-50-fg';
        this._openMessageBox();
    }

    // 成功
    alertSuccess(content: string): void {
        this.barConfig.panelClass = ['alertSuccess'];
        this._snackBar.open(content, this.action && this.actionButtonLabel, this.barConfig);
    }

    // 警告
    alertWarning(content: string): void {
        this.barConfig.panelClass = ['alertWarning'];
        this._snackBar.open(content, this.action && this.actionButtonLabel, this.barConfig);
    }
    // 失败
    alertFail(content: string): void {
        this.barConfig.panelClass = ['alertFail'];
        this._snackBar.open(content, this.action && this.actionButtonLabel, this.barConfig);
    }
}
