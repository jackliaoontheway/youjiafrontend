import {Component, Input, OnInit} from '@angular/core';
import {FieldspecModel} from 'app/model/fieldspec.model';
import {RowFieldSpec} from 'app/model-view/model-view.model';
import {BaseModel} from 'app/model/base.model';
import {ModelService} from 'app/service/model.service';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {PhotoDialogComponent} from './photoDialog/photo-dialog.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
    selector: 'field-detail',
    templateUrl: './field-detail.component.html',
    styleUrls: ['./field-detail.component.scss'],
})
export class FieldDetailComponent implements OnInit{
    
    @Input()
    rowFieldSpecs: RowFieldSpec[];
    
    rowFieldData: RowFieldSpec[];
    
    @Input()
    entity: BaseModel;
    
    @Input()
    serviceUrl: string;
    
    @Input()
    entityId: number;
    
    constructor(private _modelService: ModelService, private _formBuilder: FormBuilder, private _matDialog: MatDialog, private sanitizer: DomSanitizer) {
    }
    
    ngOnInit(): void {
        // 这里初始化将rowFieldSpecs里面的每一个dataType 进行一次判断，添加photo类型
        // ques：直接加一个photo dataType类型会不会更好？
        this.rowFieldData = new Array<RowFieldSpec>();
        let hasPhotoField = false;
        let fspecName;
        for (const fSpec of this.rowFieldSpecs) {
            if (fSpec) {
                const row = new RowFieldSpec;
                if (fSpec.left) {
                    const left = Object.assign({}, fSpec.left)
                    row.left = left;
                    if (row.left.dataType && row.left.dataType === 'file') {
                        if (this.isImage(row.left)) {
                            row.left.dataType = 'photo';
                            hasPhotoField = true;
                            fspecName = row.left.name;
                            this._modelService.getImgUrl(this.serviceUrl, this.entity[fspecName].fileName, this.entityId).then(imgBase64 => {
                                if (imgBase64 != null && imgBase64.length > 0) {
                                    this.entity[fspecName].imgBase64 = imgBase64;
                                }
                            });
                            
                        }
                    }
                    
                }
                if (fSpec.right) {
                    const right = Object.assign({}, fSpec.right)
                    row.right = right;
                    if (row.right.dataType && row.right.dataType === 'file') {
                        if (this.isImage(row.right)) {
                            row.right.dataType = 'photo';
                            hasPhotoField = true;
                            fspecName = row.right.name;
                            this._modelService.getImgUrl(this.serviceUrl, this.entity[fspecName].fileName, this.entityId).then(imgBase64 => {
                                if (imgBase64 != null && imgBase64.length > 0) {
                                    this.entity[fspecName].imgBase64 = imgBase64;
                                }
                            });
                            
                        }
                    }
                }
                this.rowFieldData.push(row);
            }
        }
    }
    
    getFieldValue(fSpec: FieldspecModel, fieldName?: string): string {
        return this._modelService.getFieldValue(this.entity, fSpec, fieldName);
    }
    
    openOrDownloadIfFile(fSpec: FieldspecModel): void {
        if (fSpec.dataType === 'file') {
            this._modelService.downloadFileDirectly(this.serviceUrl, this.entity[fSpec.name].fileName, this.entity.id, true);
        }
    }
    
    getImgUrl(fSpec: FieldspecModel): any {
        if (fSpec.dataType === 'photo' && this.entity && this.entity[fSpec.name]) {
            let imgUrl: SafeUrl = '';
            const url = 'data:image/' + this.entity[fSpec.name].fileType + ';base64,' + this.entity[fSpec.name].imgBase64;
            imgUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            return imgUrl;
        }
        return '';
    }
    
    getFieldStyle(fSpec: FieldspecModel): string {
        if (fSpec.dataType === 'file') {
            return 'cursor-pointer underline-text'; // btn-link pointer-cursor
        }
        return '';
    }
    
    showJsonForm(fSpec: FieldspecModel): boolean {
        if (fSpec && fSpec.dataType === 'json') {
            return true;
        }
        return false;
    }
    
    isImage(fSpec: FieldspecModel): boolean {
        const t = this.entity;
        if (t != null) {
            const fileType = t[fSpec.name] == null ? '' : (t[fSpec.name]['fileType'] == null ? '' : t[fSpec.name]['fileType']);
            if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'gif') {
                return true;
            }
        }
        return false;
    }
    
    showImage(fSpec: FieldspecModel): void {
        const imgTitle = fSpec.label;
        let imgUrl: SafeUrl = '';
        if (fSpec.dataType === 'photo' && this.entity && this.entity[fSpec.name]) {
            const url = 'data:image/' + this.entity[fSpec.name].fileType + ';base64,' + this.entity[fSpec.name].imgBase64;
            imgUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        this._matDialog.open(PhotoDialogComponent, {
            panelClass: 'model-form-dialog',
            data: {
                imgTitle: imgTitle,
                imgUrl: imgUrl
            }
        });
    }
    
}
