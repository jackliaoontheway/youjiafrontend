import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { RestfulService } from './restful.service';
import { ToolService } from 'app/service/tool.service';

import { UseraccountModel } from 'app/model/useraccount.model';
import { FunctionalityModel } from 'app/model/functionality.model';
import { appRuntimePara } from 'app/app-runtime-para';
import { ModelService } from '../service/model.service';

@Injectable({
    providedIn: 'root'
})
export class UseraccountService extends ModelService {

    private baseUrl = '/useraccounts/';
    constructor(http: RestfulService, translate: TranslateService,
        toolService: ToolService, formBuilder: FormBuilder) {
        super(http, translate, toolService, formBuilder);
    }

    fetchFunctionality(): Promise<FunctionalityModel[]> {
        const url = this.baseUrl + appRuntimePara.currentLoginUser.id + '/functionalities';
        return this.http.getCall(url);
    }

    register(ua: UseraccountModel): Promise<UseraccountModel> {
        const url = this.baseUrl + 'register';
        return this.http.postCall(url, ua);
    }

    confirmRegister(loginName: string, nonLoginToken: string): Promise<boolean> {
        if (loginName == null || loginName.length === 0 && nonLoginToken == null || nonLoginToken.length === 0) {
            return null;
        }
        const url = this.baseUrl + 'confirm?loginName=' + loginName + '&nonLoginToken=' + nonLoginToken;
        return this.http.postCall(url, null);
    }

    sendForgotPasswordRequest(loginName: string): Promise<boolean> {
        if (loginName == null || loginName.length === 0) {
            return null;
        }
        const url = this.baseUrl + 'reset-password-request?loginName=' + loginName;
        return this.http.postCall(url, null);
    }

    resetUserPassword(loginName: string, nonLoginToken: string, newPassword: string): Promise<boolean> {
        if (loginName == null || loginName.length === 0) {
            return null;
        }
        if (nonLoginToken == null || nonLoginToken.length === 0) {
            return null;
        }
        if (newPassword == null || newPassword.length === 0) {
            return null;
        }
        const url = this.baseUrl + 'reset-password?loginName=' + loginName + '&nonLoginToken=' + nonLoginToken + '&newPassword=' + newPassword;
        return this.http.postCall(url, null);
    }
}
