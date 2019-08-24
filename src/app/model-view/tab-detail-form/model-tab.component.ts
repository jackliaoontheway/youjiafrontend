import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FormGroup, FormArray } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';

import { TranslateService } from '@ngx-translate/core';

import { BaseModel } from 'app/model/base.model';
import { FieldspecModel } from 'app/model/fieldspec.model';
import { ModelspecModel } from 'app/model/modelspec.model';
import { FunctionalityModel } from 'app/model/functionality.model';
import { ViewFieldSpecModel } from 'app/model-view/model-view.model';
import { ModelService } from 'app/service/model.service';

@Component({
    selector: 'model-tab',
    templateUrl: './model-tab.component.html',
    styleUrls: ['./model-tab.component.scss'],
    animations: fuseAnimations
})
export class ModelTabComponent implements OnInit, AfterViewInit {

    fileUploader: FileUploader = null;

    @Input()
    modelFormTitle: string;

    @Input()
    serviceUrl: string;

    @Input()
    actionString: string;

    @Input()
    entityId: number;

    @Input()
    entity: BaseModel;

    @Output()
    backAction = new EventEmitter<any>();

    readOnly = true;

    @Input()
    modelSpec: ModelspecModel;

    viewFieldSpecs: ViewFieldSpecModel;

    @Input()
    fieldSpecs: FieldspecModel[];

    modelForm: FormGroup = null;

    validForm: boolean;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    totalOperatin = -1;

    totalModelOperation = 0;

    onPageOperation: FunctionalityModel[];

    underMenuOperation: FunctionalityModel[];

    constructor(private _transService: TranslateService, private _modelService: ModelService,
        private _matDialog: MatDialog) {
    }

    private _createModelForm(entity: BaseModel, _modelService: ModelService, fieldSpecs: FieldspecModel[]): FormGroup {
        if (fieldSpecs) {
            fieldSpecs.forEach(fSpec => {
                fSpec.inputType = _modelService.generateInputType(fSpec);
                this._modelService.splitI18nResources(this.entity, this.entity.i18nResources, this.fieldSpecs);
                fSpec.i18nResourcesForField = this._modelService.getFieldResources(this.entity, fSpec, this.fieldSpecs);
            });
            return _modelService.createModelForm(entity, this.fieldSpecs);
        }
    }

    ngOnInit(): void {
        this.totalOperatin = -1;
        this.loadEntity(this.entityId);
        this.viewFieldSpecs = this._modelService.generateViewFieldSpecs(this.fieldSpecs);
    }

    // 检查该业务模型有没有实例操作
    hasInstanceOperations(): boolean {
        const res = (this.modelSpec && this.modelSpec.objectFunctionalities
            && this.modelSpec.objectFunctionalities.length > 0);
        return res;
    }

    // 确认是否有某个实例操作， 需要基于权限，业务模型的业务含义等等来判断
    hasInstanceOperation(fun: FunctionalityModel): boolean {
        switch (fun.pathUrl) {
        }
        return true;
    }

    // 执行基于实例的操作
    onInstanceFunction(fun: FunctionalityModel, fileInputElm: any): void {
    }

    loadEntity(id: number): void {
        if (id && id !== 0) {
            this._modelService.fetchEntityById(this.serviceUrl, id).then(entitis => {
                if (entitis) {
                    this.entity = entitis[0];
                    this.modelForm = this._createModelForm(this.entity, this._modelService, this.fieldSpecs);
                }
            });
        } else {
            this.modelForm = this._createModelForm(this.entity, this._modelService, this.fieldSpecs);
        }
    }

    ngAfterViewInit(): void {
        this.validForm = false;
    }

    onCloseOrCancel(): void {
        if (this.modelSpec.addible) {
            this.backAction.emit(true);
        } else {
            this.actionString = 'detail';
            this.loadEntity(this.entityId);
        }
    }

    onDetailClose(): void {
        this.backAction.emit(true);
    }

    onFormValidChanged(valid: boolean): void {
        this.validForm = valid;
    }

    getTitleValue(e: BaseModel, fSpec: FieldspecModel): string {
        // 2019.8.14 jumper
        // 处理支持多层联系对象和嵌套对象的expansion-panel-title显示
        return this._modelService.convertObjectIntoString(e, fSpec.labelField, fSpec.componentMetaDatas);
        // return e[fSpec.labelField];
    }

    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName: string): string {
        if (e == null) {
            return this._modelService.getFieldValue(this.entity, fSpec, fieldName);
        } else {
            return this._modelService.getFieldValue(e, fSpec, fieldName);
        }
    }

    onDeleteButton(): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, { disableClose: false });
        this.confirmDialogRef.componentInstance.confirmTitle = this._transService.instant('Confirm.title.delete');
        this.confirmDialogRef.componentInstance.confirmMessage =
            this._transService.instant('Confirm.content.delete');
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._modelService.removeEntity(this.serviceUrl, this.entity).then(() => {
                    this.onCloseOrCancel();
                });
            }
            this.confirmDialogRef = null;
        });
    }

    onSaveButton(): void {
        const formEntity: BaseModel = this.modelForm.getRawValue();
        formEntity.fileInfo = this.entity.fileInfo;
        let uploadedFileName: string = null;
        if (formEntity.fileInfo != null && formEntity.fileInfo.file.content != null) {
            formEntity.fileInfo.file.content.setOptions({ url: this._modelService.generateTheBeforeCreationUrl(this.serviceUrl, formEntity.id) });
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
                    const fieldNames = formEntity.fileInfo.fieldName.split('-');
                    let tempEntity = null;
                    // 暂时支持两层文件上传，到子model的文件上传
                    if (fieldNames.length > 1) {
                        tempEntity = formEntity[fieldNames[0]][fieldNames[1]] = {};
                        tempEntity['fileName'] = fName;
                        tempEntity['fileType'] = fName.substr(fName.lastIndexOf('.') + 1);
                    } else {
                        tempEntity = formEntity[fieldNames[0]] = {};
                        tempEntity['fileName'] = fName;
                        tempEntity['fileType'] = fName.substr(fName.lastIndexOf('.') + 1);
                    }
                    // let tempEntity = null;
                    // for (let i = 0; i < fieldNames.length; i++) {
                    //     tempEntity = formEntity[fieldNames[i]] = {};
                    //     tempEntity['fileName'] = fName;
                    //     tempEntity['fileType'] = fName.substr(fName.lastIndexOf('.') + 1);
                    // }
                    // console.log('=======');
                    // console.log(formEntity);
                    that._modelService.saveEntity(that.serviceUrl, formEntity).then(() => {
                        that.onCloseOrCancel();
                    });
                }
            };
            formEntity.fileInfo.file.content.uploadAll();
        } else {
            this._modelService.saveEntity(this.serviceUrl, formEntity).then(() => {
                this.onCloseOrCancel();
            });
        }
    }

    onFileSelected(event: EventEmitter<File[]>): void {
        this.fileUploader.uploadAll();
    }

    addNewItem(fSpec: FieldspecModel): void {
        const v = this.modelForm.controls[fSpec.name].value;
        let compArrayForm: FormArray;
        if (v == null) {
            compArrayForm = this._modelService.generateFieldFormArray(this.modelForm, fSpec);
        } else {
            compArrayForm = <FormArray>this.modelForm.controls[fSpec.name];
        }
        compArrayForm.push(this._modelService.createModelForm(new BaseModel(), fSpec.componentMetaDatas));
    }

    onRemoveButtonClick(controls: FormArray, i: number): void {
        controls.removeAt(i);
        this.validForm = this.modelForm.valid;
    }

    countFunction(): number {
        if (this.totalOperatin !== -1) {
            return this.totalOperatin;
        }
        let total = 0;
        if (this.modelSpec && this.modelSpec.deletable) {
            this.totalModelOperation++;
            total = total + 1;
        }
        if (this.modelSpec && this.modelSpec.updatable) {
            this.totalModelOperation++;
            total = total + 1;
        }
        if (this.modelSpec && this.modelSpec.objectFunctionalities) {
            total = total + this.modelSpec.objectFunctionalities.length;
        }
        this.totalOperatin = total;
        if (total >= 4) {
            this.onPageOperation = new Array<FunctionalityModel>();
            this.underMenuOperation = new Array<FunctionalityModel>();

            for (let i = 0; i < (2 - this.totalModelOperation); i++) {
                this.onPageOperation.push(this.modelSpec.objectFunctionalities[i]);
            }
            for (let i = (2 - this.totalModelOperation); i < this.modelSpec.objectFunctionalities.length; i++) {
                this.underMenuOperation.push(this.modelSpec.objectFunctionalities[i]);
            }
        }
        return this.totalOperatin;
    }
}
