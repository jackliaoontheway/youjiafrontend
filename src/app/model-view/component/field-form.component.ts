import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FileUploader } from 'ng2-file-upload';
import { TranslateService } from '@ngx-translate/core';

import { FieldspecModel } from 'app/model/fieldspec.model';
import { SelectiveItem } from 'app/model/fieldspec.model';
import { ModelService } from 'app/service/model.service';
import { BaseModel } from 'app/model/base.model';
import { FileInfoDesc } from 'app/model/base.model';
import { FileInfo } from 'app/model/fileinfo.model';
import { appRuntimePara } from 'app/app-runtime-para';

@Component({
    selector: 'field-form',
    templateUrl: './field-form.component.html',
    styleUrls: [],
})
export class FieldFormComponent implements OnInit, OnDestroy {

    @Input()
    fieldSpecs: FieldspecModel[];

    @Input()
    entity: BaseModel;

    @Input()
    modelForm: FormGroup;

    @Output()
    formValidChanged = new EventEmitter<boolean>();

    supportLanguages: any[];

    filteredOptions = new Array<Observable<any[]>>();

    myControl = new Array<FormControl>();

    fileNameControl = new FormControl();

    fileUploader: FileUploader = new FileUploader({ removeAfterUpload: true });
    vailsRequired: string;
    vailMinlength: string;
    vailMaxlength: string;
    vailMinVal: string;
    vailMaxVal: string;
    vailEmail: string;

    constructor(private _modelService: ModelService, 
        private _formBuilder: FormBuilder, private _translate: TranslateService) {
    }

    ngOnDestroy(): void {
        for (const fSpec of this.fieldSpecs) {
            if (fSpec.selectiveItems && fSpec.selectiveItems.length > 0) {
                fSpec.selectiveItems.forEach(item => item.checked = false);
            }
        }
    }

    ngOnInit(): void {
        if (appRuntimePara.supportedLanguages.length > 0) {
            this.supportLanguages = appRuntimePara.supportedLanguages;
        }

        for (const fSpec of this.fieldSpecs) {
            if (fSpec.enumFlag && fSpec.selectiveItems.length > 10) {
                this.myControl[fSpec.name] = new FormControl();
                for (const item of fSpec.selectiveItems) {
                    // // jumper 2019.8.12
                    // // bugfix:针对如果entity有多个item,而每个item都有selectItem>10,使用autoComplete选择器的情况
                    // // 根据entity进行初始化选择器的值和对值进行变更后的相应处理
                    if (item.value === this.getSingleSelectionInitialValue(fSpec)){
                        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];
                        if (fSpec.dataType === 'object') {
                            const elm = new BaseModel();
                            elm.id = Number.parseInt(item.value, 10);
                            cons.setValue(elm);
                        } else {
                            cons.setValue(item.value);
                        }
                        this.myControl[fSpec.name].setValue(item.label);
                    }
                }
                this.filteredOptions[fSpec.name] = this.myControl[fSpec.name].valueChanges
                    .pipe(startWith<string>(''),
                        map(selectiveItem => selectiveItem ? 
                            this._filter(fSpec, selectiveItem) : fSpec.selectiveItems.slice())
                    );
            } else if (fSpec.dataType === 'file') {
                this.fileNameControl.setValue(this.modelForm.controls[fSpec.name].value.fileName);
            }
        }
        this.initVailMsg();
        // 备注byjumper 2019.8.6:修复不支持多层嵌套编辑的bug(2层以上)
        // fix当entity[fSpec.name] == null 时的报错导致嵌套多层<field-form>时,页面显示失败
        if (this.entity == null){
            this.entity = new BaseModel();
        }
    }

    initVailMsg(): void {
        this.vailsRequired = this._translate.instant('Error.form.required');
        this.vailMinlength = this._translate.instant('Error.form.minlength');
        this.vailMaxlength = this._translate.instant('Error.form.maxlength');
        this.vailMinVal = this._translate.instant('Error.form.minVal');
        this.vailMaxVal = this._translate.instant('Error.form.maxVal');
        this.vailEmail = this._translate.instant('Error.form.email');
    }

    onFormValidChanged(valid: boolean): void {
        this.formValidChanged.emit(this.modelForm.valid);
    }

    private _filter(fSpec: FieldspecModel, label: any): SelectiveItem[] {
        const filterValue = label.toLowerCase();
        // 使用includes 替换indexOf,可模糊搜索每一个字符
        return fSpec.selectiveItems.filter(selectiveItem => 
            selectiveItem.label.toLowerCase().includes(filterValue));
    }

    showThisFieldForEditing(fSpec: FieldspecModel): boolean {
        if (fSpec.autogenerated) {
            return false;
        }
        if (fSpec.inputType === 'file') {
            return true;
        }
        if (!fSpec.embedded && fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            return false;
        }
        return true;
    }

    onValueChange(): void {
        this.formValidChanged.emit(this.modelForm.valid);
    }
    
    // jumper 2019.8.5
    // bugfix:针对如果entity有多个item,而每个item都有单选或者多选选择器这种情况
    // 那么就不能直接使用fSpec里面的selectiveItem的checked选项,需要根据entity实时判断每一个item的实际返回值比对
    getCheckInitialValue(fSpec: FieldspecModel, selectiveItem: SelectiveItem): boolean {
        const dataType: string = fSpec.dataType;
        if (dataType === 'array') {
            if (this._containValue(this.entity[fSpec.name], selectiveItem.value)){
                return true;
            }
        } else if (dataType === 'object') {
            if (this.entity[fSpec.name] == null){
                return false;
            }
            if (this.entity[fSpec.name].id === Number.parseInt(selectiveItem.value, 10)){
                return true;
            }
        } else if (dataType === 'boolean') {
            if ((this.entity[fSpec.name] + '') === selectiveItem.value){
                return true;
            }
        } else {
            if (this.entity[fSpec.name] && this.entity[fSpec.name].length > 0) {
                if (this.entity[fSpec.name] === selectiveItem.value
                    || this.entity[fSpec.name] === selectiveItem.label){
                    return true;
                }
            }
        }
        return false;
    }
    
    // jumper 2019.8.5
    // bugfix:针对如果entity有多个item,而每个item都有单选或者多选选择器这种情况
    // 那么就不能直接使用fSpec里面的selectiveItem的checked选项,需要根据entity实时判断每一个item的实际返回值比对
    getSingleSelectionInitialValue(fSpec: FieldspecModel): string {
        if (fSpec == null || fSpec.selectiveItems == null || fSpec.selectiveItems.length === 0) {
            return '';
        }
        // for (const item of fSpec.selectiveItems) {
        //     if (item.checked) {
        //         console.log(item.value);
        //         return item.value;
        //     }
        // }
        // // return '';
        if (this.entity && this.entity[fSpec.name] != null) {
            for (const item of fSpec.selectiveItems) {
                const dataType: string = fSpec.dataType;
                if (dataType === 'array') {
                    if (this._containValue(this.entity[fSpec.name], item.value)){
                        return item.value;
                    }
                } else if (dataType === 'object') {
                    if (this.entity[fSpec.name] == null){
                        return '';
                    }
                    if (this.entity[fSpec.name].id === Number.parseInt(item.value, 10)){
                        return item.value;
                    }
                } else if (dataType === 'boolean') {
                    if ((this.entity[fSpec.name] + '') === item.value){
                        return item.value;
                    }
                } else {
                    if (this.entity[fSpec.name] && this.entity[fSpec.name].length > 0) {
                        if (this.entity[fSpec.name] === item.value
                            || this.entity[fSpec.name] === item.label){
                            return item.value;
                        }
                    }
                }
            }
        }
        return '';
    }
    
    private _containValue(values: Array<BaseModel>, curValue: string): boolean {
        if (values) {
            for (let i = 0; i < values.length; i++) {
                const v: number = values[i].id;
                if (Number.parseInt(curValue, 10) === v) {
                    return true;
                }
            }
        }
        return false;
    }


    onSelectionChanged(fSpec: FieldspecModel, value: string): void {
        this.formValidChanged.emit(this.modelForm.valid);
        const cons: FormArray = <FormArray>this.modelForm.controls[fSpec.name];
        let hasValue = false;
        for (let ii = 0; ii < cons.length; ii++) {
            if (cons.controls[ii].value['id'] === Number.parseInt(value, 10)) {
                hasValue = true;
                cons.removeAt(ii);
                break;
            }
        }
        if (!hasValue) {
            const elm = new BaseModel();
            elm.id = Number.parseInt(value, 10);
            cons.push(new FormControl(elm));
        }
    }

    onSingleValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.value, 10);
            cons.setValue(elm);
        } else {
            cons.setValue(event.value);
        }
        this.formValidChanged.emit(this.modelForm.valid);
    }
    
    // jumper 2019.8.8
    // 添加多选下拉框选择器,在datatype为string 和 multiChoice 为true时使用
    // 数据保存的格式将会是以','隔开数据("xx,xx,xx"),可以为枚举和对象进行业务数据上的保存
    // fixme QUES:这里发现angular 页面上使用的方法,初始化页面时里面有循环的话,初始化时,方法也会执行多次
    //  而且随着鼠标或者页面变更会重复执行方法,估计是angular会一直监听页面变化,应该是angular生命周期是这样的
    // 例如 getMultipleSelectionInitialValue(),会一直更变里面的数据,导致下拉多选框选择的选择页面不进行变更
    // 所以现在的做法是在onMultipleValueChange()方法进行变更值的时候将this.entity[fSpec.name]的值也进行变更
    getMultipleSelectionInitialValue(fSpec: FieldspecModel): any {
        let multip: string[];
        if (fSpec == null || fSpec.selectiveItems == null || fSpec.selectiveItems.length === 0) {
            return;
        }
        if (this.entity && this.entity[fSpec.name] != null) {
            const s = this.entity[fSpec.name];
            multip = s.split(',');
            return multip;
        }
        return;
    }
    
    // jumper 2019.8.8
    // 添加多选下拉框选择器,在datatype为string 和 multiChoice 为true时使用
    // 数据保存的格式将会是以','隔开数据("xx,xx,xx"),可以为枚举和对象进行业务数据上的保存
    onMultipleValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];
        const selectList = event.value;
        if (selectList && selectList.length > 0) {
            const muitiple = selectList.join(',');
            this.entity[fSpec.name] = muitiple;
            cons.setValue(muitiple);
        }
        this.formValidChanged.emit(this.modelForm.valid);
    }
    
    getLanguageResourceForEditing(fSpec: FieldspecModel, languageId: string): string {
        let langRes = '';
        if (!this.modelForm.controls['i18nResources']) {
            return langRes;
        }
        const i18nKeyFieldValue = this._modelService.getCurrentI18nKeyFieldValue(this.fieldSpecs, this.modelForm);
        const i18nKey = fSpec.classFullName + '.' + fSpec.name + '.' + i18nKeyFieldValue;
        const res = <Array<any>>this.modelForm.controls['i18nResources'].value;
        for (let i = 0; i < res.length; i++) {
            if (languageId === res[i].languageId && i18nKey === res[i].i18nKey) {
                langRes = res[i].i18nValue;
            }
        }
        return langRes;
    }

    onI18nValueChange(fSpec: FieldspecModel, langKey: string, value: string): void {
        const i18nKeyFieldValue = this._modelService.getCurrentI18nKeyFieldValue(this.fieldSpecs, this.modelForm);
        this._modelService.updateI18nResource(this.modelForm, fSpec, langKey, value, i18nKeyFieldValue);
        const specControls = <FormControl>this.modelForm.controls[fSpec.name];
        specControls.setValue(value);
        this.formValidChanged.emit(this.modelForm.valid);
    }
    
    // jumper 2019.8.12
    onAutoCompleteSelected(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];

        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.option.viewValue.split(',')[1], 10);
            cons.setValue(elm);
            // 如果不变更entity的id值,那么页面执行的一些初始化方法会一直重置该选择器的值为初始化值
            // 提交表单时使用的是this.modelForm里面的东西,所以不会对提交的数据有影响
            if (this.entity[fSpec.name] == null){
                this.entity[fSpec.name] = new BaseModel();
            }
            this.entity[fSpec.name].id = elm.id;
        } else {
            cons.setValue(event.option.viewValue.split(',')[1]);
            this.entity[fSpec.name] = event.option.viewValue.split(',')[1];
        }
        this.formValidChanged.emit(this.modelForm.valid);
    }

    onFileValue(fSpec: FieldspecModel): void {
        this.fileNameControl.setValue(this.fileUploader.queue[0]._file.name);
        const fileInfo = new FileInfo();
        fileInfo.content = this.fileUploader;
        if (this.entity.fileInfo == null) {
            this.entity.fileInfo = new FileInfoDesc();
        }
        this.entity.fileInfo.file = fileInfo;
        let fieldName = '';
        let tempFieldSpec = fSpec;
        while (tempFieldSpec != null) {
            fieldName = tempFieldSpec.name + '-' + fieldName;
            tempFieldSpec = tempFieldSpec.parentFieldSpecification;
        }
        this.entity.fileInfo.fieldName = fieldName.substring(0, fieldName.length - 1);
        this.formValidChanged.emit(this.modelForm.valid);
    }

    getFieldValue(fSpec: FieldspecModel, fieldName: string): string {
        return this._modelService.getFieldValue(this.entity, fSpec, fieldName);
    }

    onJsonFormChanged(entityAction: number): void {
        const fieldName = entityAction[0];
        const fieldValue = entityAction[1];
        this.modelForm.controls[fieldName].setValue(fieldValue);
    }
}
