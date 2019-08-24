import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

import { ModelPopComponent } from 'app/model-view/pop-detail-form/model-pop.component';
import { BaseModel } from 'app/model/base.model';
import { UseraccountService } from 'app/service/useraccount.service';
import { MessageService } from 'app/message/message.service';
import { APPCONSTANT } from 'app/app-constants';
import { appRuntimePara } from 'app/app-runtime-para';
import { FieldspecModel } from 'app/model/fieldspec.model';
import { ModelspecModel } from 'app/model/modelspec.model';
import { ViewFieldSpecModel } from 'app/model-view/model-view.model';

@Component({
    selector: 'user-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProfileComponent implements OnInit, OnDestroy {
    dialogRef: any;
    backUrl = '';
    serviceUrl = '/useraccounts/';
    fieldSpecs: Array<FieldspecModel>;
    modelSpec: ModelspecModel;
    viewFieldSpecs: ViewFieldSpecModel;
    currentUserAccount: BaseModel = null;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _msgService: MessageService,
        private _matDialog: MatDialog,
        private _uaService: UseraccountService,
        private _router: Router,
        private _routeInfo: ActivatedRoute,
        private _formBuilder: FormBuilder
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.currentUserAccount = appRuntimePara.currentLoginUser;
    }

    ngOnInit(): void {
        this.backUrl = this._routeInfo.snapshot.queryParams['backUrl'];

        this._uaService.fetchMetadata(this.serviceUrl).then(mSpecs => {
            if (mSpecs && mSpecs.length > 0) {
                this.fieldSpecs = mSpecs[0].fieldSpecs;
                this.modelSpec = mSpecs[0];
                this.fieldSpecs.sort(FieldspecModel.sortTableHeader);
                this._handleMetaDatas(this.fieldSpecs, true, null);
            }
            if (this.fieldSpecs != null && this.fieldSpecs.length > 0) {
                this.viewFieldSpecs = new ViewFieldSpecModel();
                for (const fSpec of this.fieldSpecs) {
                    if (fSpec.dataType === 'file' || fSpec.componentMetaDatas == null || fSpec.componentMetaDatas.length === 0) {
                        this.viewFieldSpecs.addNormalField(fSpec);
                    } else {
                        if (fSpec.dataType === 'object') {
                            this.viewFieldSpecs.addSubNormalField(this.viewFieldSpecs.oneToOneNormalFields, fSpec);
                        } else if (fSpec.dataType === 'array') {
                            this.viewFieldSpecs.addSubNormalField(this.viewFieldSpecs.oneToManyNormalFields, fSpec);
                        }
                    }
                }
            }
            this._initDialog();
        });
    }

    private _initDialog(): void {

        let contactFieldSpecs = null;
        for (const compField of this.fieldSpecs) {
            if (compField.name === 'contact') {
                contactFieldSpecs = compField.componentMetaDatas;
                break;
            }
        }
        let contactViewFieldSpec = null;
        for (const compViewField of this.viewFieldSpecs.oneToOneNormalFields) {
            if (compViewField.parentFieldSpec.name === 'contact') {
                contactViewFieldSpec = compViewField;
                break;
            }
        }
        const contactModelSpec = new ModelspecModel();
        contactModelSpec.deletable = false;
        contactModelSpec.batchDeletable = false;
        let contactM: BaseModel = appRuntimePara.currentLoginUser.contact;
        if (contactM == null) {
            contactM = new BaseModel();
        }
        this.dialogRef = this._matDialog.open(ModelPopComponent, {
            panelClass: 'model-form-dialog',
            data: {
                entity: contactM,
                fieldSpecs: contactFieldSpecs,
                viewFieldSpecs: contactViewFieldSpec,
                serviceUrl: this.serviceUrl,
                modelSpec: contactModelSpec,
                action: 'edit'
            }
        });

        this.dialogRef.afterClosed().subscribe(response => {
            if (!response) {
                this._router.navigateByUrl(this.backUrl);
                return;
            }
            const actionType: string = response[0];
            const entityForm: FormGroup = response[1];
            switch (actionType) {
                case 'save':
                    const responseEntity: BaseModel = response[2];
                    const contactModel = entityForm.getRawValue();
                    const currentUserAccount = appRuntimePara.currentLoginUser;
                    currentUserAccount.contact = contactModel;
                    currentUserAccount.fileInfo = responseEntity.fileInfo;
                    let uploadedFileName: string = null;
                    if (currentUserAccount.fileInfo != null && currentUserAccount.fileInfo.file.content != null) {
                        currentUserAccount.fileInfo.file.content.setOptions({ url: this._uaService.generateTheBeforeCreationUrl(this.serviceUrl, responseEntity.id) });
                        const that = this;
                        currentUserAccount.fileInfo.file.content.onCompleteItem = (item: any, uploadResponse: any, status: any, headers: any) => {
                            if (uploadResponse != null) {
                                const res = JSON.parse(uploadResponse);
                                if (res != null && res.dataList != null && res.dataList.length > 0) {
                                    uploadedFileName = res.dataList[0];
                                }
                            }
                        };
                        currentUserAccount.fileInfo.file.content.onCompleteAll = function (): void {
                            if (uploadedFileName.length > 0) {
                                const fName: string = uploadedFileName;
                                currentUserAccount[contactModel.fileInfo.fieldName] = {};
                                currentUserAccount[contactModel.fileInfo.fieldName]['fileName'] = fName;
                                currentUserAccount[contactModel.fileInfo.fieldName]['fileType'] = fName.substr(fName.lastIndexOf('.') + 1);
                                that._uaService.saveEntity(that.serviceUrl, currentUserAccount).then(() => {
                                });
                            }
                        };
                        currentUserAccount.fileInfo.file.content.uploadAll();
                    } else {
                        this._uaService.saveEntity(this.serviceUrl, currentUserAccount).then(() => {
                        });
                    }
                    break;
                default:
                    break;
            }
            this._router.navigateByUrl(this.backUrl);
        });
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private _handleMetaDatas(_fieldSpecs: Array<FieldspecModel>, isModelField: boolean, parentFieldSpec: FieldspecModel): void {
        let hiddenFields = '';
        let colCount = 0;
        if (appRuntimePara.currentLoginUser.userSetting && appRuntimePara.currentLoginUser.userSetting.tableHiddenFields) {
            const hiddenFieldMap = JSON.parse(appRuntimePara.currentLoginUser.userSetting.tableHiddenFields);
            const modelName: string = this.modelSpec.className.substr(this.modelSpec.className.lastIndexOf('.') + 1);
            hiddenFields = hiddenFieldMap[modelName];
            if (!hiddenFields) {
                hiddenFields = '';
            }
        }
        for (const fSpec of _fieldSpecs) {
            fSpec.parentFieldSpecification = parentFieldSpec;
            if (hiddenFields.indexOf(fSpec.name + ',') !== -1) {
                fSpec.hide = true;
            }
            fSpec.selectiveItems = this._uaService.generateSeletiveItems(fSpec);
            fSpec.hideComponent = true;
            fSpec.isValid = true;
            if (!fSpec.hide && isModelField) {
                switch (colCount) {
                    case 0: fSpec.fxhide = false; fSpec.gtxs = true; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 1: fSpec.fxhide = false; fSpec.gtxs = true; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 2: fSpec.fxhide = true; fSpec.gtxs = true; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 3: fSpec.fxhide = true; fSpec.gtxs = true; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 4: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 5: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = true; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 6: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = false; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 7: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = false; fSpec.gtmd = true; fSpec.gtlg = true; break;
                    case 8: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = false; fSpec.gtmd = false; fSpec.gtlg = true; break;
                    case 9: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = false; fSpec.gtmd = false; fSpec.gtlg = true; break;
                    default: fSpec.fxhide = true; fSpec.gtxs = false; fSpec.gtsm = false; fSpec.gtmd = false; fSpec.gtlg = false; break;
                }
                colCount++;
            }
            if (fSpec.componentMetaDatas) {
                this._handleMetaDatas(fSpec.componentMetaDatas, false, fSpec);
            }
            fSpec.clearSearchCondition = false;
        }
    }
}
