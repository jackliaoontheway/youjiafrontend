import { Component, OnInit, DoCheck, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';

import { UseraccountModel } from 'app/model/useraccount.model';
import { AuthService } from 'app/service/auth.service';
import { APPCONSTANT } from 'app/app-constants';

interface LangSpec {
    key: string;
    label: string;
}

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit, DoCheck {
    loginForm: FormGroup;

    supportedLanguages: LangSpec[];

    constructor(private _fuseConfigService: FuseConfigService,
        private _transService: TranslateService,
        private _cookieService: CookieService,
        private _router: Router,
        private _authService: AuthService,
        private _formBuilder: FormBuilder) {
        this._fuseConfigService.config = {
            layout: {
                navbar: { hidden: true },
                toolbar: { hidden: true },
                footer: { hidden: true },
                sidepanel: { hidden: true }
            }
        };
    }

    ngOnInit(): void {
        const loginEmail = this._cookieService.get(APPCONSTANT.COOKIENAME.LOGIN_EMAIL);
        const rememberMe = (loginEmail === '' ? false : true);
        this.loginForm = this._formBuilder.group({
            email: [loginEmail, [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [rememberMe]
        });
    }

    ngDoCheck(): void {
        if (!this.supportedLanguages) {
            const lanInCookie = this._cookieService.get(APPCONSTANT.COOKIENAME.SUPPORTED_LANGUAGES);
            if (lanInCookie != null && lanInCookie.length > 0) {
                this.supportedLanguages = JSON.parse(lanInCookie);
            }
        }
    }

    onRememberMeChanged(event: any): void {
        if (!event.checked) {
            this._cookieService.delete(APPCONSTANT.COOKIENAME.LOGIN_EMAIL);
        }
    }

    activeLanguage(langKey: string): string {
        const cookieLang: string = this._cookieService.get(APPCONSTANT.COOKIENAME.LANGUAGE);
        if (cookieLang === langKey) {
            this._transService.use(langKey);
            return 'accent';
        }
        return '';
    }

    switchLanguage(langKey: string): void {
        this._cookieService.set(APPCONSTANT.COOKIENAME.LANGUAGE, langKey, 0, '/');
        this._transService.use(langKey);
    }

    login(): void {
        const that = this;
        const loginUser = new UseraccountModel();
        loginUser.loginName = this.loginForm.value.email;
        loginUser.password = this.loginForm.value.password;

        this._authService.login(loginUser).then(u => {
            if (u && u[0] && u[0].status === 'ACTIVE') {
                if (that.loginForm.value.rememberMe) {
                    that._cookieService.set(APPCONSTANT.COOKIENAME.LOGIN_EMAIL, that.loginForm.value.email, 0, '1');
                }
                const d = new Date();
                const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate(),
                    d.getHours() + APPCONSTANT.COOKIENAME.TIME_OUT_HOUR, d.getMinutes());
                that._cookieService.set(APPCONSTANT.COOKIENAME.HAS_LOGIN, 'true', dd, '/');

                const languageWillBeLoaded =
                    that._authService.resetLoginUserForAppRuntime(u, that._transService.currentLang);
                that._transService.use(languageWillBeLoaded).toPromise().then(() => {
                    if (u[0].userSetting != null && u[0].userSetting.firstPageUrl != null) {
                        that._router.navigate([u[0].userSetting.firstPageUrl]);
                    } else {
                        that._router.navigate(['dashboard']);
                    }
                });
                that._cookieService.set(APPCONSTANT.COOKIENAME.LANGUAGE, languageWillBeLoaded, 0, '/');
            }
        });
    }
}
