import { Injectable } from '@angular/core';

import { FuseNavigation } from '@fuse/types';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { APPCONSTANT } from 'app/app-constants';
import { appRuntimePara } from 'app/app-runtime-para';

import { UseraccountModel } from 'app/model/useraccount.model';
import { FunctionalityModel } from 'app/model/functionality.model';

import { UseraccountService } from 'app/service/useraccount.service';
import { RestfulService } from 'app/service/restful.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = '/loginaudit/';
    constructor(private http: RestfulService, private _fuseNavigationService: FuseNavigationService,
        private _userAccountService: UseraccountService, private _cookieService: CookieService,
        private _router: Router) {

    }
    login(useracc: UseraccountModel): Promise<UseraccountModel[]> {
        const s = this.http.postCall(this.baseUrl + 'login', useracc);
        return s;
    }

    currentLogin(): Promise<UseraccountModel[]> {
        const url = this.baseUrl + 'login';
        return this.http.getCall(url);
    }

    logout(): Promise<UseraccountModel> {
        return this.http.postCall(this.baseUrl + 'logout', null);
    }

    listSupportedLanguage(): Promise<string[]> {
        const url = '/languages';
        return this.http.getCall(url);
    }

    resetLoginUserForAppRuntime(loginUsers: UseraccountModel[], defaultLanguaged: string): string {
        let languageWillBeLoaded = defaultLanguaged;
        if (loginUsers && loginUsers[0]) {
            appRuntimePara.currentLoginUser = new UseraccountModel();
            appRuntimePara.currentLoginUser = loginUsers[0];
            languageWillBeLoaded = appRuntimePara.currentLoginUser.userSetting.viewLang;
            this._fetchMenuForCurrentLoginUser(
                appRuntimePara.currentLoginUser.userSetting.firstPageUrl);
        } else {
            if (this._fuseNavigationService.existNavigation(APPCONSTANT.NAV_NAME)) {
                this._fuseNavigationService.unregister(APPCONSTANT.NAV_NAME);
            }
            this._cookieService.delete(APPCONSTANT.COOKIENAME.HAS_LOGIN);
            appRuntimePara.currentLoginUser = new UseraccountModel();
            this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
        }
        return languageWillBeLoaded;
    }

    private _fetchMenuForCurrentLoginUser(menuId: string): void {
        let menuDatas: FunctionalityModel[];
        this._userAccountService.fetchFunctionality().then(menus => {
            menuDatas = menus;
            if (menuDatas != null && menuDatas.length > 0) {
                this._sortMenu(menuDatas);
                this._convertToFuseNavigationData(menuDatas);
                for (const menuData of menuDatas) {
                    if (menuId === menuData.code) {
                        // FIXME： 需要增加转到指定页面的代码。
                        break;
                    }
                }
            }
        });
    }

    private _sortMenu(menus: FunctionalityModel[]): void {
        menus.sort((a: FunctionalityModel, b: FunctionalityModel) => {
            return a.positionSn - b.positionSn;
        });
        for (const menu of menus) {
            if (menu.subMenus != null && menu.subMenus.length > 0) {
                this._sortMenu(menu.subMenus);
            }
        }
    }

    private _convertToFuseNavigationData(menuDatas: FunctionalityModel[]): void {
        let navigation: FuseNavigation[];
        if (menuDatas == null || menuDatas.length === 0) {
            navigation = null;
            return;
        }
        navigation = new Array<FuseNavigation>();
        menuDatas.forEach(firstLevelMenu => {
            if (firstLevelMenu.code === 'menu.self') {
                return;
            }
            if (firstLevelMenu.subMenus != null && firstLevelMenu.subMenus.length > 0) {
                const nav = this._createNavItem(firstLevelMenu, 'group');
                nav.children = new Array<FuseNavigation>();
                firstLevelMenu.subMenus.forEach(secondMenu => {
                    let childNav: FuseNavigation;
                    if (secondMenu.subMenus != null && secondMenu.subMenus.length > 0) {
                        childNav = this._createNavItem(secondMenu, 'collapsable');
                        childNav.children = new Array<FuseNavigation>();
                        secondMenu.subMenus.forEach(thirdMenu => {
                            const lastChildNav = this._createNavItem(thirdMenu, 'item');
                            childNav.children.push(lastChildNav);
                        });
                    } else {
                        childNav = this._createNavItem(secondMenu, 'item');
                    }
                    nav.children.push(childNav);
                });
                navigation.push(nav);
            }
        });

        // Register the navigation to the service
        if (this._fuseNavigationService.existNavigation(APPCONSTANT.NAV_NAME)) {
            this._fuseNavigationService.unregister(APPCONSTANT.NAV_NAME);
        }
        this._fuseNavigationService.register(APPCONSTANT.NAV_NAME, navigation);
        this._fuseNavigationService.setCurrentNavigation(APPCONSTANT.NAV_NAME);
    }

    private _createNavItem(menuItem: FunctionalityModel, menuType: any): FuseNavigation {
        const nav: FuseNavigation = {
            id: menuItem.code,
            title: menuItem.label,
            icon: menuItem.iconName,
            type: menuType,
            url: menuItem.pathUrl
        };
        return nav;
    }
}
