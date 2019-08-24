import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { UseraccountService } from 'app/service/useraccount.service';
import { MessageService } from 'app/message/message.service';
import { APPCONSTANT } from 'app/app-constants';

@Component({
    selector: 'reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    resetPasswordForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;

    private loginName: string;
    private nonLoginToken: string;

    constructor(
        private _msgService: MessageService,
        private _uaService: UseraccountService,
        private _router: Router,
        private _routeInfo: ActivatedRoute,
        private _formBuilder: FormBuilder
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.resetPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });

        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });
        this.loginName = this._routeInfo.snapshot.queryParams['loginName'];
        this.nonLoginToken = this._routeInfo.snapshot.queryParams['nonLoginToken'];
        this.resetPasswordForm.controls['email'].setValue(this.loginName);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onBtnClick(): void {
        const newPassword: string = this.resetPasswordForm.get('password').value;
        if (this.loginName != null && this.loginName.length > 0
            && this.nonLoginToken != null && this.nonLoginToken.length > 0
            && newPassword != null && newPassword.length > 0) {
            this._uaService.resetUserPassword(this.loginName, this.nonLoginToken, newPassword).then(isSuccess => {
                if (isSuccess) {
                    this._msgService.information('密码设置成功，请登录系统。');
                    this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
                }
            });
        }
    }
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');
    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { 'passwordsNotMatching': true };
};
