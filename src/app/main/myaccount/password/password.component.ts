import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

import { UseraccountService } from 'app/service/useraccount.service';
import { MessageService } from 'app/message/message.service';
import { APPCONSTANT } from 'app/app-constants';
import { appRuntimePara } from 'app/app-runtime-para';

@Component({
    selector: 'user-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PasswordComponent implements OnInit, OnDestroy {
    resetPasswordForm: FormGroup;

    backUrl = '';
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _msgService: MessageService,
        private _uaService: UseraccountService,
        private _router: Router,
        private _routeInfo: ActivatedRoute,
        private _formBuilder: FormBuilder
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.resetPasswordForm = this._formBuilder.group({
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });

        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });
        this.backUrl = this._routeInfo.snapshot.queryParams['backUrl'];
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onCancel(): void {
        this._router.navigateByUrl(this.backUrl);
    }

    onBtnClick(): void {
        const newPassword: string = this.resetPasswordForm.get('password').value;

        if (newPassword != null && newPassword.length > 0) {
            appRuntimePara.currentLoginUser.password = newPassword;
            this._uaService.saveEntity('/useraccounts/', appRuntimePara.currentLoginUser).then(userAcc => {
                if (userAcc != null) {
                    this._msgService.information('密码设置成功，请登录系统。');
                    this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
                }
            });
        }
    }
}

const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

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
