import { Component, Input, Output, Inject, EventEmitter, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CookieService } from 'ngx-cookie-service';

import { FileUploader } from 'ng2-file-upload';

import { FormGroup } from '@angular/forms';
import { ModelPopComponent } from 'app/model-view/pop-detail-form/model-pop.component';
import { MessageService } from '../../message/message.service';

import { BaseModel } from 'app/model/base.model';
import { FieldspecModel, SelectiveItem } from 'app/model/fieldspec.model';
import { ModelspecModel } from 'app/model/modelspec.model';
import { ViewFieldSpecModel } from 'app/model-view/model-view.model';
import { FunctionalityModel } from 'app/model/functionality.model';

import { ModelService } from 'app/service/model.service';

import { appRuntimePara } from 'app/app-runtime-para';
import { APPCONSTANT } from 'app/app-constants';
import { isNumber } from 'util';
import { GrantFunctionalityToUserroleComponent } from 'app/main/systemmgmt/grant-functionality-to-userrole/grant-functionality-to-userrole.component';
import { UsergroupManagementComponent } from 'app/main/systemmgmt/usergroup-management/usergroup-management.component';
import { AddUserToUserGroupComponent } from 'app/main/systemmgmt/add-user-to-user-group/add-user-to-user-group.component';

@Component({
    selector: 'model-list',
    templateUrl: '../list/model-list.component.html',
    styleUrls: ['../list/model-list.component.scss'],
    animations: fuseAnimations
})
export class ModelListComponent implements OnInit {

    fileUploader: FileUploader = null;

    @Input()
    serviceUrl: string;

    @Output()
    entityIdChanged = new EventEmitter<any>();

    selectedEntity: BaseModel;

    selectedEntityIds: number[] = new Array<number>();

    entities: BaseModel[];

    @Input()
    searchCriteria: BaseModel;

    @Input()
    fieldSpecs: Array<FieldspecModel>;

    @Input()
    modelSpec: ModelspecModel;

    @Input()
    modelSpecs: ModelspecModel[];

    viewFieldSpecs: ViewFieldSpecModel;

    @Input()
    modelName: string;

    @Input()
    tabValue: string;

    // for paging begin
    totalRecords = 0;
    currentPage = 1;
    pageSize = 5; // we use different initial value for reproducing bug easily.
    totalPages = 0;
    pageSizeValues: number[] = [10, 25, 50, 100];
    // for paging end

    showLoading = false;
    initialColumns = ['buttons', 'checkbox'];
    columnsToDisplay: string[] = new Array<string>(); // new Array<string>();
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    private modelSpecSelectorDlgRef: MatDialogRef<ModelSelectionDialogComponent>;
    dialogRef: MatDialogRef<ModelPopComponent>;

    constructor(private _translate: TranslateService,
        private _cookieService: CookieService,
        private _modelService: ModelService,
        private _matDialog: MatDialog,
        private _msgService: MessageService) {
    }

    ngOnInit(): void {
        const supportedLanguagesString: string[] = new Array<string>();
        const that = this;
        this.fileUploader = new FileUploader({ removeAfterUpload: true });
        this.fileUploader.onCompleteAll = function (): void {
            that.onPageChange(that.currentPage, that.pageSize);
            const response = that.fileUploader.response;
            if (!response.hasError) {
                that._msgService.alertSuccess(that._translate.instant('upload-file-success'));
            } else {
                that._msgService.alertSuccess(that._translate.instant('upload-file-fail'));
            }
        };
        if (appRuntimePara.supportedLanguages.keys != null) {
            for (const obj of appRuntimePara.supportedLanguages) {
                supportedLanguagesString.push(obj[0]);
            }
        }
        this._translate.addLangs(supportedLanguagesString);
        this._translate.use(appRuntimePara.currentLoginUser.userSetting.viewLang);
        if (appRuntimePara.currentLoginUser.userSetting && appRuntimePara.currentLoginUser.userSetting.pageSize) {
            this.pageSize = appRuntimePara.currentLoginUser.userSetting.pageSize;
        }

        // 为了和 html 一致,这里要增加判断
        // QUESTION : 如果特殊功能 需要批量操作,并且没有删除或者下载的情况 这里就没有选择框了
        if (this.modelSpec && (this.modelSpec.batchDeletable || this.modelSpec.downloadable)) {
            this.initialColumns.forEach(e => {
                this.columnsToDisplay.push(e);
            });
        } else {
            this.columnsToDisplay.push(this.initialColumns[0]);
        }

        this.fieldSpecs.forEach(fSpec => {
            if (!fSpec.hide) {
                that.columnsToDisplay.push(fSpec.name);
            }
        });
        this.currentPage = Number.parseInt(this._cookieService.get(APPCONSTANT.COOKIENAME.CURRENT_PAGE), 10);
        if (this.currentPage == null || Number.isNaN(this.currentPage)) {
            this.currentPage = 1;
        }
        this.viewFieldSpecs = this._modelService.generateViewFieldSpecs(this.fieldSpecs);
        this.onPageChange(this.currentPage, this.pageSize);
    }

    onPaginatorChanged(event: any): void {
        this.onPageChange(event.pageIndex + 1, event.pageSize);
    }

    onPageChange(currentPage: number, pageSize: number, elm?: any): void {
        this.showLoading = true;
        let cri: BaseModel = this.searchCriteria;
        // console.log(this.searchCriteria);
        if (!cri) {
            cri = this.generateModel();
        }
        if (this.totalPages !== 0 && (currentPage > this.totalPages)) {
            cri.pageIndex = 1;
        } else {
            cri.pageIndex = currentPage;
        }
        if (this.tabValue && this.modelSpec.tabField) {
            cri[this.modelSpec.tabField] = this.tabValue;
        } else {
            delete cri[this.modelSpec.tabField];
        }
        if (this.fieldSpecs) {
            for (const fSpec of this.fieldSpecs) {
                if (fSpec.usedForSorting) {
                    cri.sortField = fSpec.name;
                    cri.sortDesc = fSpec.descSort;
                }
            }
        }
        this._cookieService.set(APPCONSTANT.COOKIENAME.CURRENT_PAGE, '' + cri.pageIndex, 0, '/');
        this.pageSize = pageSize;
        cri.curPageSize = pageSize;
        cri.sortField = this.modelSpec.indexField;
        cri.sortDesc = this.modelSpec.indexSortDesc;
        this._modelService.fetchEntities(this.serviceUrl, cri).then(pageResp => {
            this.entities = pageResp.dataList;
            this.currentPage = pageResp.currentPageIndex + 1;
            this.totalRecords = pageResp.totalRecords;
            this.totalPages = pageResp.totalPages;
            if (elm) {
                elm.value = this.currentPage;
            }

            if (!this.modelSpec.addible && this.entities != null &&
                this.entities.length === 1 && this.totalPages === 1) {
                // 该业务模型只有一个数据同时又没有增加的功能，直接去详情页面
                this.selectEntity(this.entities[0]);
            }
            this.showLoading = false;
        });
    }

    hasModelOperation(action: string, modepSpec: ModelspecModel): boolean {
        let res = false;
        switch (action) {
            case 'add':
                res = this.modelSpec != null && this.modelSpec.addible;
                break;
            case 'batchdelete':
                res = this.modelSpec != null && this.modelSpec.deletable && this.modelSpec.batchDeletable;
                break;
            case 'download':
                res = this.modelSpec != null && this.modelSpec.downloadable;
                break;
            case 'upload':
                res = this.modelSpec != null && this.modelSpec.uploadable;
                break;
            case 'update':
                res = this.modelSpec != null && this.modelSpec.updatable;
                break;
            case 'delete':
                res = this.modelSpec != null && this.modelSpec.deletable;
                break;
            case 'clone':
                res = this.modelSpec != null && this.modelSpec.cloneable && this.modelSpec.addible;
                break;
        }
        return res;
    }

    // 确认是否有某个类型级别的操作， 需要基于权限，业务模型的业务含义等等来判断
    hasClassOperation(fun: FunctionalityModel): boolean {
        switch (fun.pathUrl) {
        }
        return true;
    }

    // elm 应该是一个html 的 file input element
    // ques 因为按钮显示都是后端已经控制好了,所以这里名字规范后,
    // 这里可以优化成,通过pathurl自动获取后对应的方法,这个switch是否就没有必要了?
    // 可以配置适应扩展
    // 将一些model 方法抽出来,这些方法按道理应该根据路由去加载对应的方法,然后是调用每个路由独有的功能和方法.
    // 这里应该是抽象出使用对应方法的东西
    onClassFunction(fun: FunctionalityModel, elm: any): void {
        switch (fun.pathUrl) {
            case 'uploadManifest': this.onUploadManifest(elm); break;
        }
    }

    private onUploadManifest(elm: any): void {
        this.fileUploader.setOptions({url: this._modelService.generateUrlContext(this.serviceUrl) + 'uploadManifest'});
        elm.click();
    }
    

    // 确认是否有某个实例操作， 需要基于权限，业务模型的业务含义等等来判断
    hasInstanceOperation(fun: FunctionalityModel): boolean {
        switch (fun.pathUrl) {
        }
        return true;
    }

    

    deleteSelectedEntities(): void {
        if (this.selectedEntityIds.length > 0) {
            this._deleteEntitiesWithConfirmation();
        }
    }

    downloadSelectedEntities(): void {
        this._modelService.downloadSelectedEntity(this.serviceUrl, this.selectedEntityIds);
        this.onPageChange(this.currentPage, this.pageSize);
        this.selectedEntityIds = new Array<number>();
    }

    // 一个按钮代表一个方法?是否更好的方案去处理方法?
    // 应该可以抽象出更通用的方法,可以持续扩展,不知道这样合不合理
    // 如果有问题或者设计不合理,这里就回滚代码
    onInstanceFunction(fun: FunctionalityModel, id: any): void {
        switch (fun.pathUrl) {
            case 'grantFuncationalityToUserRole': this.onGrantFuncationalityToUserRole(this, id, fun.pathUrl); break;
        }
    }

    onGrantFuncationalityToUserRole(obj: any, id: number, functionType: string): void {
        obj._matDialog.open(GrantFunctionalityToUserroleComponent, {
            height: '860px',
            width: '960px',
            panelClass: 'table-dialog',
            data: {
                modelTitle: 'Grant functionality to user role',
                serviceUrl: obj.serviceUrl,
                userRoleId: id
            }
        });
    }

    onDownloadTemplateFile(): void {
        this._modelService.downloadTemplateFile(this.serviceUrl);
    }

    // elm 应该是一个html 的 file input element
    onUploadEntityDataFile(fileInputElm: any): void {
        this.fileUploader.setOptions({ url: this._modelService.generateUploadUrl(this.serviceUrl) });
        fileInputElm.click();
        this.fileUploader.onCompleteItem = (item: any, uploadResponse: any, status: any, headers: any) => {
            const res = JSON.parse(uploadResponse);
            if (res != null && res.statusList != null && res.statusList.length > 0) {
                if (this._msgService) {
                    if (res.statusList[0].error) {
                        this._msgService.alertFail(res.statusList[0].code + ': ' + res.statusList[0].desc);
                    } else {
                        this._msgService.alertSuccess(res.statusList[0].code + ': ' + res.statusList[0].desc);
                    }
                }
            }
        };
    }

    onFileSelected(event: EventEmitter<File[]>): void {
        this.fileUploader.uploadAll();
    }

    removeEntity(e: BaseModel): void {
        this._deleteEntityWithConfirmation(e);
    }

    checkSelection(entityId: number): string {
        if (this.selectedEntityIds.length > 0) {
            const index = this.selectedEntityIds.indexOf(entityId);
            if (index !== -1) {
                return 'checked';
            }
        }
        return '';
    }

    onSelectAllChanged(checked: boolean): void {
        this.selectedEntityIds = new Array<number>();
        if (checked) {
            for (const e of this.entities) {
                this.selectedEntityIds.push(e.id);
            }
        }
    }

    isAllSelectionChecked(): string {
        if (this.selectedEntityIds && this.entities) {
            if (this.selectedEntityIds.length === this.entities.length) {
                return 'checked';
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    onSelectedChange(entityId: number): void {
        if (this.selectedEntityIds.length > 0) {
            const index = this.selectedEntityIds.indexOf(entityId);
            if (index !== -1) {
                this.selectedEntityIds.splice(index, 1);
                return;
            }
        }
        this.selectedEntityIds.push(entityId);
    }

    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName: string): string {
        return this._modelService.getFieldValue(e, fSpec, fieldName);
    }

    generateModel(entity?: BaseModel): BaseModel {
        return this._modelService.generateModel(entity, this.modelName);
    }

    cloneEntity(entity: BaseModel): void {
        entity.id = null;
        this.selectEntity(entity, 'add');
    }

    selectEntity(entity: BaseModel, action?: string): void {
        if (action == null) {
            action = 'detail';
        }
        const that = this;
        if (entity == null) {
            if (this.modelSpecs.length > 1) {
                // 新增数据，在有多个业务模型说明的情况下，需要提供模型类型选择。
                const modelSelections: SelectiveItem[] = new Array<SelectiveItem>();
                this.modelSpecs.forEach(mSpec => {
                    const mSelcetion: SelectiveItem = new SelectiveItem();
                    mSelcetion.label = mSpec.label;
                    mSelcetion.value = mSpec.className.substring(mSpec.className.lastIndexOf('.') + 1);
                    modelSelections.push(mSelcetion);
                });
                this.modelSpecSelectorDlgRef = this._matDialog.open(ModelSelectionDialogComponent, {
                    data: modelSelections
                });
                // this.selectedEntity.entityName = 'SubSystemUser';

                this.modelSpecSelectorDlgRef.afterClosed().subscribe(result => {
                    entity = that._modelService.generateModel(entity, that.modelName);
                    if (result) {
                        entity.entityName = result;
                        that.backToModelViewPage(entity, action);
                    }
                    that.modelSpecSelectorDlgRef = null;
                });
            } else {
                entity = this._modelService.generateModel(entity, this.modelName);
                this.backToModelViewPage(entity, action);
            }

        } else {
            this.backToModelViewPage(entity, action);
        }
    }

    private backToModelViewPage(entity: BaseModel, action?: string): void {
        // 这里判断是否有子业务模型。有的话，执行model-view.componment.ts里面的onEntityIdChanged重新设置该entity的viewType，
        // 那么就会加载model-view.componment.html里面的model-tap这个组件，以tap形式显示详情
        if (this._modelService.hasModelField(this.fieldSpecs)) {
            this.entityIdChanged.emit([entity == null ? null : entity.id, action, entity]);
            return;
        }
        // 对于弹窗显示的编辑变单，打开详情或者编辑时从服务器再获取一次完整的数据，包括i18n数据等
        if (entity.id && entity.id != null) {
            this._modelService.fetchEntityById(this.serviceUrl, entity.id).then(entitis => {
                if (entitis) {
                    const _entity = entitis[0];
                    this._openEntityDialog(_entity, action);
                }
            });
        } else {
            // 新增数据时,直接打开dialog
            this._openEntityDialog(entity, action);
        }
    }

    private _openEntityDialog(entity: BaseModel, action?: string): void {
        // 如果没有子业务模型。就会以下面的Dialog形式打开弹窗
        this.dialogRef = this._matDialog.open(ModelPopComponent, {
            panelClass: 'model-form-dialog',
            data: {
                entity: entity,
                fieldSpecs: this.fieldSpecs,
                viewFieldSpecs: this.viewFieldSpecs,
                serviceUrl: this.serviceUrl,
                modelSpec: this.modelSpec,
                action: action
            }
        });

        this.dialogRef.afterClosed().subscribe(response => {
            if (!response) {
                return;
            }
            const actionType: string = response[0];
            const entityForm: FormGroup = response[1];
            switch (actionType) {
                case 'add':
                case 'save':
                    const responseEntity: BaseModel = response[2];
                    const formEntity: BaseModel = entityForm.getRawValue();
                    formEntity.fileInfo = responseEntity.fileInfo;
                    let uploadedFileName: string = null;
                    if (formEntity.fileInfo != null && formEntity.fileInfo.file.content != null) {
                        formEntity.fileInfo.file.content.setOptions({ url: this._modelService.generateTheBeforeCreationUrl(this.serviceUrl, responseEntity.id) });
                        const that = this;
                        formEntity.fileInfo.file.content.onCompleteItem = (item: any, uploadResponse: any, status: any, headers: any) => {
                            if (uploadResponse != null) {
                                const res = JSON.parse(uploadResponse);
                                if (res != null && res.dataList != null && res.dataList.length > 0) {
                                    uploadedFileName = res.dataList[0];
                                }
                            }
                        };
                        formEntity.fileInfo.file.content.onCompleteAll = function (): void {
                            if (uploadedFileName.length > 0) {
                                const fName: string = uploadedFileName;
                                formEntity[formEntity.fileInfo.fieldName] = {};
                                formEntity[formEntity.fileInfo.fieldName]['fileName'] = fName;
                                formEntity[formEntity.fileInfo.fieldName]['fileType'] = fName.substr(fName.lastIndexOf('.') + 1);
                                that._modelService.saveEntity(that.serviceUrl, formEntity).then(() => {
                                    that.onPageChange(that.currentPage, that.pageSize);
                                });
                            }
                        };
                        formEntity.fileInfo.file.content.uploadAll();
                    } else {
                        this._modelService.saveEntity(this.serviceUrl, formEntity).then(() => {
                            this.onPageChange(this.currentPage, this.pageSize);
                        });
                    }
                    break;
                case 'delete':
                    this._deleteEntityWithConfirmation();
                    break;
            }
        });
    }

    private _deleteEntityWithConfirmation(e?: BaseModel): void {
        if (e == null) {
            e = this.selectedEntity;
        }
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, { disableClose: false });
        this.confirmDialogRef.componentInstance.confirmTitle = this._translate.instant('Confirm.title.delete');
        this.confirmDialogRef.componentInstance.confirmMessage = this._translate.instant('Confirm.content.delete');
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._modelService.removeEntity(this.serviceUrl, e).then(() => {
                    this.onPageChange(this.currentPage, this.pageSize);
                });
            }
            this.confirmDialogRef = null;
        });
    }

    private _deleteEntitiesWithConfirmation(): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, { disableClose: false });
        this.confirmDialogRef.componentInstance.confirmTitle = this._translate.instant('Confirm.title.delete');
        this.confirmDialogRef.componentInstance.confirmMessage = this._translate.instant('Confirm.content.delete');
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._modelService.removeEntities(this.serviceUrl, this.selectedEntityIds).then(m => {
                    if (m) {
                        this.onPageChange(this.currentPage, this.pageSize);
                        this.selectedEntityIds = new Array<number>();
                    }
                });
            }
            this.confirmDialogRef = null;
        });
    }

    private _titleCase(str: string): string {
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

}

@Component({
    selector: 'model-selection-dialog',
    template: `
        <h1 mat-dialog-title>Model Selector</h1>
        <div mat-dialog-content>
            <mat-select placeholder="Model Name" [value]="" (selectionChange)="onModelSelected($event)">
                <mat-option *ngFor="let model of models" [value]="model.value">
                    {{model.label}}
                </mat-option>
            </mat-select>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="dialogRef.close()">Cancel</button>
            <button mat-button (click)="dialogRef.close(selectedModel)">OK</button>
        </div>
    `,
})
export class ModelSelectionDialogComponent {
    models: SelectiveItem[];
    selectedModel = '';
    constructor(public dialogRef: MatDialogRef<ModelSelectionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SelectiveItem[]) {
        this.models = data;
    }

    onModelSelected(event: any): void {
        this.selectedModel = event.value;
    }
}
