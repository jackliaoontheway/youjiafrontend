import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config.service';

import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { APPCONSTANT } from 'app/app-constants';
import { AuthService } from 'app/service/auth.service';
import { appRuntimePara } from 'app/app-runtime-para';


interface LangSpec {
    key: string;
    label: string;
    flag: string;
}

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit, OnDestroy {
    fuseConfig: any;

    firstMenuId: string;
    selectedLanguage: LangSpec;

    languageLoaded = false;
    loginUserLoaded = false;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(private _router: Router,
        private _titleService: Title,
        private _fuseConfigService: FuseConfigService,
        private _transService: TranslateService,
        private _cookieService: CookieService,
        private _authService: AuthService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: any) => {
                this.fuseConfig = config;
            });
        this._transService.onLangChange.subscribe(() => {
            this._titleService.setTitle(this._transService.instant('App.browserTitle'));
        });
        this._initLanguage();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _initLanguage(): void {
        const that = this;
        this._cookieService.delete(APPCONSTANT.COOKIENAME.SUPPORTED_LANGUAGES);

        this._authService.listSupportedLanguage().then(langs => {
            if (langs && langs.length > 0) {
                appRuntimePara.supportedLanguages = new Array<LangSpec>();
                if (APPCONSTANT.MULTI_LANGUAGE) {
                    langs.forEach(lang => {
                        const l: string[] = lang.split(',');
                        appRuntimePara.supportedLanguages.push({ key: l[0], label: l[1], flag: l[0].substr(3) });
                    });
                    that._setLanguageFromServer();
                } else {
                    that._setDefaultLanguage();
                }
            } else {
                that._setDefaultLanguage();
            }
        });
    }

    private _loadLoginUserThenLanguage(languageKey: string): void {
        const that = this;
        const isLogin = (this._cookieService.get(APPCONSTANT.COOKIENAME.HAS_LOGIN) != null
            && this._cookieService.get(APPCONSTANT.COOKIENAME.HAS_LOGIN).length > 0);
        if (isLogin) {
            this._authService.currentLogin().then(u => {
                that.loginUserLoaded = true;
                const languageWillBeLoaded =
                    that._authService.resetLoginUserForAppRuntime(u, languageKey);
                that._transService.use(languageWillBeLoaded).toPromise().then(() => this.languageLoaded = true);
                that._cookieService.set(APPCONSTANT.COOKIENAME.LANGUAGE, languageWillBeLoaded, 0, '/');
                if (u != null && u.length > 0 && u[0].userSetting != null) {
                    that._router.navigateByUrl(u[0].userSetting.firstPageUrl || APPCONSTANT.DASHBOARD_URL);
                } else {
                    that._router.navigateByUrl(APPCONSTANT.DASHBOARD_URL);
                }
            });
        } else {
            this._fuseConfigService.config = {
                layout: {
                    navbar: { hidden: true },
                    toolbar: { hidden: true },
                    footer: { hidden: true },
                    sidepanel: { hidden: true }
                }
            };
            this.loginUserLoaded = true;
            this._transService.use(languageKey).toPromise().then(() => this.languageLoaded = true);
            this._cookieService.set(APPCONSTANT.COOKIENAME.LANGUAGE, languageKey, 0, '/');
            const currentLink = location.href.substr(document.getElementsByTagName('base')[0].href.length);
            let isLoginNeededUrl = true;
            APPCONSTANT.NOTLOGIN_URLS.forEach(link => {
                if (currentLink.startsWith(link)) {
                    isLoginNeededUrl = false;
                }
            });
            if (isLoginNeededUrl) {
                this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
            }
        }
    }

    private _setDefaultLanguage(): void {
        this._transService.addLangs([APPCONSTANT.DEFAULT_LANGUAGE.key]);
        this._transService.setDefaultLang(APPCONSTANT.DEFAULT_LANGUAGE.key);
        this._cookieService.set(APPCONSTANT.COOKIENAME.SUPPORTED_LANGUAGES,
            JSON.stringify([APPCONSTANT.DEFAULT_LANGUAGE]), 0, '/');
        this._loadLoginUserThenLanguage(APPCONSTANT.DEFAULT_LANGUAGE.key);
    }

    private _setLanguageFromServer(): void {
        const supportedLanguagesString = new Array<string>();
        appRuntimePara.supportedLanguages.forEach(lang => supportedLanguagesString.push(lang['key']));
        this._cookieService.set(APPCONSTANT.COOKIENAME.SUPPORTED_LANGUAGES,
            JSON.stringify(appRuntimePara.supportedLanguages), 0, '/');
        this._transService.addLangs(supportedLanguagesString);
        this._transService.setDefaultLang(APPCONSTANT.DEFAULT_LANGUAGE.key);
        const cookieLang = this._cookieService.get(APPCONSTANT.COOKIENAME.LANGUAGE);
        let languageWillBeUsed = APPCONSTANT.DEFAULT_LANGUAGE.key;
        if (cookieLang) {
            languageWillBeUsed = cookieLang;
        } else {
            const browserLang = this._transService.getBrowserCultureLang().toLowerCase();
            if (browserLang) {
                for (const langStr of supportedLanguagesString) {
                    if (langStr.indexOf(browserLang) !== -1) {
                        languageWillBeUsed = langStr;
                        break;
                    }
                }
            }
        }
        this._loadLoginUserThenLanguage(languageWillBeUsed);
    }

}
