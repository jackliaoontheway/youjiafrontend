import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import * as _ from 'lodash';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseNavigation } from '@fuse/types';

import { APPCONSTANT } from 'app/app-constants';
import { UseraccountModel } from 'app/model/useraccount.model';
import { AuthService } from 'app/service/auth.service';
import { appRuntimePara } from 'app/app-runtime-para';

import { UseraccountService } from 'app/service/useraccount.service';
import { FunctionalityModel } from 'app/model/functionality.model';

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent implements OnInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    supporttedLanguages: any;
    selectedLanguage: any;
    navigation: FuseNavigation[];
    curUser: UseraccountModel = null;

    // 当前用户准备打开的页面，当是页面刷新的时候，使用当前页面，如果是登录进入系统，则是用户自定义的第一个页面
    firstMenuId: string;
    menuDatas: FunctionalityModel[];

    appName: string;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _router: Router,
        private _fuseNavigationService: FuseNavigationService,
        private _userAccountService: UseraccountService,
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private _cookieService: CookieService,
        private _authService: AuthService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        const path = this._router.url;
        this.firstMenuId = path.substr(path.lastIndexOf('/') + 1, path.length);
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });
        this.curUser = appRuntimePara.currentLoginUser;
        this.supporttedLanguages = JSON.parse(this._cookieService.get(APPCONSTANT.COOKIENAME.SUPPORTED_LANGUAGES));
        this.selectedLanguage = _.find(this.supporttedLanguages,
            { 'key': this._cookieService.get(APPCONSTANT.COOKIENAME.LANGUAGE) });
    }
    gotoDashboard(): void {
        this._router.navigateByUrl(APPCONSTANT.DASHBOARD_URL);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpen(key: any): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    setLanguage(lang: any): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.key);
        const user: UseraccountModel = appRuntimePara.currentLoginUser;
        user.userSetting.viewLang = lang.key;
        this._cookieService.set(APPCONSTANT.COOKIENAME.LANGUAGE, lang.key, 0, '/');
        this._userAccountService.saveEntity('/useraccounts/', user).then(u => {
            window.location.reload();
        });
    }

    logout(): void {
        this._fuseNavigationService.unregister(APPCONSTANT.NAV_NAME);
        this._authService.logout();
        // 貌似ngx-cookie-service的删除有问题，如果不给path，在刷新一次页面之后，
        // 就不能删除这个cookie。
        this._cookieService.delete(APPCONSTANT.COOKIENAME.HAS_LOGIN, '/');
        this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
        appRuntimePara.currentLoginUser = new UseraccountModel();
    }

    currentLink(): string {
        return location.href.substr(document.getElementsByTagName('base')[0].href.length);
    }
}
