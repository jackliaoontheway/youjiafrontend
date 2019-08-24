import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { fuseAnimations } from '@fuse/animations';

import { UseraccountService } from 'app/service/useraccount.service';
import { MessageService } from 'app/message/message.service';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;

    constructor(
        private _msgService: MessageService,
        private _uaService: UseraccountService,
        private _formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onBtnClick(): void {
        const loginName = this.forgotPasswordForm.get('email').value;
        this._uaService.sendForgotPasswordRequest(loginName).then(isReset => {
            if (isReset != null && isReset[0] != null && isReset[0]) {
                this._msgService.information('请登录注册时使用的邮箱，打开pm@polarj.com发送的重设密码邮件，点击重设密码链接，重新设置密码后再登录');
            } else {
                this._msgService.error('没有这个用户，或者不能给这个用户重设密码。');
            }
        });
    }
}
