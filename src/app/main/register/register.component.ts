import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { fuseAnimations } from '@fuse/animations';

import { UseraccountModel } from 'app/model/useraccount.model';
import { UseraccountService } from 'app/service/useraccount.service';
import { MessageService } from 'app/message/message.service';
import { APPCONSTANT } from 'app/app-constants';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;

    private _unsubscribeAll: Subject<any>;

    private loginName: string;
    private nonLoginToken: string;
    constructor(
        private _formBuilder: FormBuilder,
        private _msgService: MessageService,
        private _router: Router,
        private _routeInfo: ActivatedRoute,
        private _uaService: UseraccountService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });
        this.loginName = this._routeInfo.snapshot.queryParams['loginName'];
        this.nonLoginToken = this._routeInfo.snapshot.queryParams['nonLoginToken'];
        if (this.loginName != null && this.loginName.length > 0 && this.nonLoginToken != null && this.nonLoginToken.length > 0) {
            // 这应该是从激活邮件中打开的链接
            this._uaService.confirmRegister(this.loginName, this.nonLoginToken).then(isActived => {
                if (isActived != null && isActived[0]) {
                    this._msgService.information('用户已经激活，请直接登录');
                    this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
                }
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onRegisterBtnClick(): void {
        const ua: UseraccountModel = UseraccountModel.createEntity(null);
        ua.loginName = this.registerForm.get('email').value;
        ua.password = this.registerForm.get('password').value;
        ua.contact['name'] = this.registerForm.get('name').value;
        this._uaService.register(ua).then(responseUser => {
            if (responseUser != null) {
                this._msgService.information('请登录注册时使用的邮箱，打开pm@polarj.com发送的激活帐号邮件，点击激活帐号之后，再登录本系统');
            }
        });
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
