import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import { environment } from 'app/../environments/environment';

import { APPCONSTANT } from 'app/app-constants';
import { LoggerService } from 'app/service/logger.service';
import * as FileSaver from 'file-saver';

import { PageResponse } from 'app/model/page.response.model';

import { MessageService } from 'app/message/message.service';


class ClientReq {
    nonceToken: string;
    data: any;
}
class StatusList {
    referenceNo: string;
    error: boolean;
    code: string;
    desc: string;
}
class ServerResponse {
    currentPageIndex: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    statusList: StatusList[];
    dataList: any[];
}
@Injectable({
    providedIn: 'root'
})
export class RestfulService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private optionsWithoutHeaders = { withCredentials: true };
    private optionsWithHeaders = { headers: this.headers, withCredentials: true };

    private fileTypeAcceptStringMap = {
        'pdf': 'application/pdf',
        'xml': 'application/xml',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'json': 'application/json',
        'txt': 'text/plain',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
    };

    private canOpenFileType = {
        'pdf': 'application/pdf',
        'xml': 'application/xml',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'txt': 'text/plain',
        'json': 'application/json',
    };

    constructor(private http: HttpClient, private logger: LoggerService, private _msgService: MessageService,
        private _translateService: TranslateService, private _router: Router, private _cookieService: CookieService) {
    }

    private extractData(value: ServerResponse): any {
        const that = this;
        if (value === null) {
            return null;
        }
        const body: ServerResponse = value;
        if (body.statusList && body.statusList.length > 0) {
            if (that._msgService) {
                if (body.statusList[0].error) {
                    that._msgService.alertFail(body.statusList[0].code + ': ' + body.statusList[0].desc);
                } else {
                    that._msgService.alertSuccess(body.statusList[0].code + ': ' + body.statusList[0].desc);
                }
            } else {
                that.logger.log(body.statusList[0].code, body.statusList[0].desc);
            }
        }
        return body.dataList || null;
    }

    private extractPageData(value: ServerResponse): PageResponse {
        const that = this;
        if (value === null) {
            return null;
        }
        const body: PageResponse = <PageResponse>value;
        if (body.statusList && body.statusList.length > 0) {
            if (that._msgService) {
                that._msgService.alertFail(body.statusList[0].code + '\n' + body.statusList[0].desc);
            } else {
                that.logger.log(body.statusList[0].code, body.statusList[0].desc);
            }
        }
        return body;
    }

    private handleError(error: HttpResponse<Object>): any {
        let errorMsgKey: string;
        if (parseInt('' + (error.status / 100), 10) === 3) {
            errorMsgKey = 'http.3XX';
        } else if (parseInt('' + (error.status / 100), 10) === 5) {
            errorMsgKey = 'http.5XX';
        } else if (parseInt('' + (error.status / 100), 10) === 4) {
            if (error.status === 401 || error.status === 403 || error.status === 404) {
                errorMsgKey = 'http.' + error.status;
            } else {
                errorMsgKey = 'http.4XX';
            }
        } else if (error.status === 0) {
            // 不知道为什么会变成这个错误代码的：
            // 貌似Shiro的错误信息都变成了这个错误代码，但是浏览器调试时，看到的是403或者其他。
            errorMsgKey = 'http.401';
        } else {
            errorMsgKey = 'http.XXX';
        }
        if (error.status === 401 || error.status === 0) {
            this._cookieService.delete(APPCONSTANT.COOKIENAME.HAS_LOGIN);
            this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
            return null;
        }
        this._popupErrorMessage(errorMsgKey);
        return null;
    }

    private _popupErrorMessage(errorMsgKey: string): void {
        let errorMsg: string;
        const that = this;
        let lang = this._cookieService.get(APPCONSTANT.COOKIENAME.LANGUAGE);
        if (!lang || lang.length === 0) {
            lang = this._translateService.defaultLang;
        }
        this._translateService.use(lang).subscribe(() => {
            errorMsg = this._translateService.instant(errorMsgKey);
            if (that._msgService) {
                that._msgService.error(errorMsg);
            } else {
                that.logger.log(errorMsg);
            }
        });

    }

    postCallForPaging(url: string, para: any): Promise<PageResponse> {
        if (this._isLoginTimeOut()) {
            return new Promise<any>(null);
        }
        const that = this;
        const clientReq: ClientReq = new ClientReq();
        clientReq.nonceToken = this._generateNonceToken();
        clientReq.data = para;
        return this.http
            .post(environment.baseUrl + url, JSON.stringify(clientReq), this.optionsWithHeaders)
            .toPromise()
            .then(value => that.extractPageData(<PageResponse>value))
            .catch(error => that.handleError(error));
    }

    postCall(url: string, para: any): Promise<any> {
        if (this._isLoginTimeOut()) {
            return new Promise<any>(null);
        }
        const that = this;
        let jsonParaString: string = null;
        if (para != null) {
            const clientReq: ClientReq = new ClientReq();
            clientReq.nonceToken = this._generateNonceToken();
            clientReq.data = para;
            jsonParaString = JSON.stringify(clientReq);
        }
        return this.http
            .post(environment.baseUrl + url, jsonParaString, this.optionsWithHeaders)
            .toPromise()
            .then(value => that.extractData(<ServerResponse>value))
            .catch(error => that.handleError(error));
    }

    putCall(url: string, para: any): Promise<any> {
        if (this._isLoginTimeOut()) {
            return new Promise<any>(null);
        }
        const that = this;
        const clientReq: ClientReq = new ClientReq();
        clientReq.nonceToken = this._generateNonceToken();
        clientReq.data = para;
        return this.http
            .put(environment.baseUrl + url, JSON.stringify(clientReq), this.optionsWithHeaders)
            .toPromise()
            .then(value => that.extractData(<ServerResponse>value))
            .catch(error => that.handleError(error));
    }

    getCall(url: string): Promise<any> {
        if (this._isLoginTimeOut() && url !== '/languages') {
            return new Promise<any>(null);
        }
        const that = this;
        return this.http
            .get(environment.baseUrl + url, this.optionsWithoutHeaders)
            .toPromise()
            .then(value => that.extractData(<ServerResponse>value))
            .catch(error => that.handleError(error));
    }

    deleteCall(url: string): Promise<any> {
        if (this._isLoginTimeOut()) {
            return new Promise<any>(null);
        }
        const that = this;
        return this.http
            .delete(environment.baseUrl + url, this.optionsWithoutHeaders)
            .toPromise()
            .then(value => that.extractData(<ServerResponse>value))
            .catch(error => that.handleError(error));
    }


    downloadCall(url: string, fileName: string, fileType: string, openFile: boolean): any {
        if (this._isLoginTimeOut()) {
            return null;
        }
        const that = this;
        if (!fileType) {
            fileType = 'pdf';
        }
        const downloadHeaders: HttpHeaders = new HttpHeaders();
        downloadHeaders.append('Accept', this.fileTypeAcceptStringMap[fileType]);
        return this.http.get(environment.baseUrl + url, { responseType: 'blob', headers: downloadHeaders, withCredentials: true }).toPromise().then(value => {
            const blob = new File([value], fileName, { type: that.fileTypeAcceptStringMap[fileType] });
            if (openFile && that.canOpenFileType[fileType] != null) {
                // 这两行代码是从浏览器直接打开从服务器得到的文件，但是一直没有找到显示文件名的方案。
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL);
            } else {
                FileSaver.saveAs(blob, fileName, false);
            }
        });
    }

    _generateNonceToken(): string {
        return '123123123';
    }


    private _isLoginTimeOut(): boolean {
        const isLogin = (this._cookieService.get(APPCONSTANT.COOKIENAME.HAS_LOGIN) != null
            && this._cookieService.get(APPCONSTANT.COOKIENAME.HAS_LOGIN).length > 0);
        if (!isLogin) {
            const currentLink = location.href.substr(document.getElementsByTagName('base')[0].href.length);
            let isLoginNeededUrl = true;
            APPCONSTANT.NOTLOGIN_URLS.forEach(link => {
                if (currentLink.startsWith(link)) {
                    isLoginNeededUrl = false;
                }
            });
            if (isLoginNeededUrl) {
                this._router.navigateByUrl(APPCONSTANT.LOGIN_PAGE_URL);
                //this._popupErrorMessage('Error.time.out');
                return true;
            } else {
                return false;
            }
        }
        return false;
    }



    uploadFile(url: string, para: any): Promise<any> {
        const that = this;
        const headers = new HttpHeaders({});
        const optionsWithHeaders = { headers: headers, withCredentials: true };

        return this.http.post(environment.baseUrl + url, para, optionsWithHeaders)
            .toPromise()
            .then(value => that.extractData(<ServerResponse>value))
            .catch(error => that.handleError(error));
    }

}
