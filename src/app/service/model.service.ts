import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { RestfulService } from './restful.service';
import { ToolService } from 'app/service/tool.service';

import { ModelspecModel } from 'app/model/modelspec.model';
import { FieldspecModel } from 'app/model/fieldspec.model';
import { SelectiveItem } from 'app/model/fieldspec.model';
import { ViewFieldSpecModel } from 'app/model-view/model-view.model';

import { BaseModel } from 'app/model/base.model';
import { I18nresourceModel } from 'app/model/i18nresource.model';

import { PageResponse } from 'app/model/page.response.model';
import { environment } from 'environments/environment';
import { isObject } from 'util';
import { APPCONSTANT } from 'app/app-constants';
@Injectable({
    providedIn: 'root'
})
export class ModelService {
    protected http: RestfulService;

    constructor(http: RestfulService, private _translate: TranslateService,
        private _toolService: ToolService, private _formBuilder: FormBuilder) {
        this.http = http;
    }

    fetchMetadata(baseUrl: string): Promise<ModelspecModel[]> {
        const url = baseUrl + 'metadata';
        return this.http.getCall(url);
    }

    generateViewFieldSpecs(fieldSpecs: FieldspecModel[]): ViewFieldSpecModel {
        if (fieldSpecs == null) {
            return null;
        }
        const viewFieldSpecs = new ViewFieldSpecModel();
        for (const fSpec of fieldSpecs) {
            if (!fSpec.detailHide) {
                if (fSpec.dataType === 'file' || fSpec.componentMetaDatas == null || fSpec.componentMetaDatas.length === 0) {
                    viewFieldSpecs.addNormalField(fSpec);
                } else {
                    if (fSpec.dataType === 'object') {
                        if (fSpec.embedded) {
                            viewFieldSpecs.addNormalField(fSpec);
                        } else {
                            viewFieldSpecs.addSubNormalField(viewFieldSpecs.oneToOneNormalFields, fSpec);
                        }
                    } else if (fSpec.dataType === 'array') {
                        viewFieldSpecs.addSubNormalField(viewFieldSpecs.oneToManyNormalFields, fSpec);
                    }
                }
            }
        }
        return viewFieldSpecs;
    }

    fetchEntities(baseUrl: string, cri: BaseModel): Promise<PageResponse> {
        let url = baseUrl + 'search';
        if (cri.sortField && cri.sortField.length > 0) {
            url = url + '?field=' + cri.sortField;
            if (cri.sortDesc) {
                url = url + '&desc=true';
            }
        }
        return this.http.postCallForPaging(url, cri);
    }

    fetchEntitiesByCriteria(baseUrl: string, functionalityPath: string, cri: any): Promise<any> {
        const url = baseUrl + functionalityPath;
        return this.http.postCall(url, cri);
    }
    saveEntitiesByCriteria(baseUrl: string, functionalityPath: string, entities: Array<any>): Promise<any> {
        const url = baseUrl + functionalityPath;
        return this.http.postCall(url, entities);
    }
    saveEntityByCriteria(baseUrl: string, functionalityPath: string, entity: any): Promise<any> {
        const url = baseUrl + functionalityPath;
        return this.http.postCall(url, entity);
    }


    fetchEntityById(baseUrl: string, id: number): Promise<BaseModel> {
        const url = baseUrl + id;
        return this.http.getCall(url);
    }


    fetchEntityByOrderNum(baseUrl: string, orderNum: String): Promise<BaseModel> {
        const url = baseUrl + orderNum;
        return this.http.getCall(url);
    }

    saveEntity(baseUrl: string, m: BaseModel): Promise<BaseModel> {
        let s = '';
        if (m.id) {
            s = s + m.id;
        }
        const url = baseUrl + s;
        this._resetEmptyStringToNull(m);
        return this.http.postCall(url, m);
    }
    
    createEntitys(baseUrl: string, m: BaseModel[]): Promise<BaseModel> {
        const url = baseUrl;
        return this.http.postCall(url, m);
    }

    private _resetEmptyStringToNull(entity: any): void {
        const properties = Object.getOwnPropertyNames(entity);
        const that = this;
        properties.forEach(property => {
            if (entity[property] === '') {
                entity[property] = null;
            } else if (isObject(entity[property])) {
                that._resetEmptyStringToNull(entity[property]);
            }
        });
    }

    removeEntity(baseUrl: string, m: BaseModel): Promise<boolean> {
        let s = '';
        if (m.id) {
            s = s + m.id;
        }
        const url = baseUrl + s;
        return this.http.deleteCall(url);
    }


    // 调整一下下载文件的方法
    downloadFileDirectly(baseUrl: string, fileName: string, id: number, openFile: boolean): void {
        this.http.downloadCall(baseUrl + 'downloadFile?fileName=' + fileName + (id != null ? '&id=' + id : ''), fileName, fileName.substr(fileName.lastIndexOf('.') + 1), openFile);
    }

    // 获取imgurl
    getImgUrl(baseUrl: string, fileName: string, id: number): Promise<any> {
        return this.http.getCall(baseUrl + 'getImgUrl?fileName=' + fileName + (id != null ? '&id=' + id : ''));
    }

    // QUES
    // 添加一个getcall通用方法
    // todo 这个idsName按道理应该改为通用的ids名字会好一点,就不用传这个参数了
    promiseIdsData(baseUrl: string, urlContect: string, ids: number[], idsName: string): Promise<any> {
        return this.http.getCall(baseUrl + urlContect + '?' + idsName + '=' + ids.toString());
    }

    downloadTemplateFile(baseUrl: string): void {
        this.http.downloadCall(baseUrl + 'downloadtemplate', 'template.xls', 'xlsx', false);
    }

    downloadSelectedEntity(baseUrl: string, ids: number[]): void {
        this.http.getCall(baseUrl + 'downloadSelectedData?entityIds=' + ids.toString()).then(
            fileName => {
                this.http.downloadCall(baseUrl + 'downloadFile?fileName=' + fileName, fileName, 'xlsx', false);
            });
        return;
    }

    entityOperation(entityId: number): void {
        // 针对某个业务模型一个实例的操作都转换成只有一个元素的数组的操作
    }

    // 对若干实例的操作:
    // baseUrl: 基本链接，包括项目链接和模型链接
    // operationUrl: 操作描述
    // entityIds， entities，searchCri： 操作需要的参数，三个数据中最多有一个（可以没有）。
    entitiesOperation(baseUrl: string, operationUrl: string,
        entityIds?: number[], entities?: BaseModel[], searchCri?: BaseModel): void {
        // 把基于业务模型的操作分成三类：
        // 1. 操作实例的与文件无关的数据
        // 2. 操作实例与文件相关的数据，比如上传与实例相关的文件，
        // 3. 打印/下载与实例相关的数据，比如：下载这些模型的数据，打印与这些模型相关的文件/报表等
    }

    removeEntities(baseUrl: string, ids: number[]): Promise<Boolean> {
        const res = false;
        return this.http.postCall(baseUrl + 'remove-request?ids=' + ids.toString(), null);
    }

    downloadAllData(baseUrl: string, cri: BaseModel): void {
        let url = baseUrl + 'downloadAllData';
        if (cri.sortField && cri.sortField.length > 0) {
            url = url + '?field=' + cri.sortField;
            if (cri.sortDesc) {
                url = url + '&desc=true';
            }
        }
        this.http.postCall(url, cri).then(fileName => {
            this.http.downloadCall(baseUrl + 'downloadFile?fileName=' + fileName + '&temporary=true', fileName, 'xlsx', false);
        });
    }

    hasModelField(fieldSpecs: FieldspecModel[]): boolean {
        let hasModelField = false;
        for (const fieldSpec of fieldSpecs) {
            if (fieldSpec.dataType === 'array' && !fieldSpec.enumFlag) {
                hasModelField = true;
                break;
            }
            if (fieldSpec.dataType === 'object' && !fieldSpec.embedded) {
                hasModelField = true;
                break;
            }
        }
        return hasModelField;
    }

    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName: string): string {
        let t: BaseModel = null;
        if (fieldName && e) {
            t = e[fieldName];
        } else {
            t = e;
        }
        if (t) {
            const typeStr: string = fSpec.dataType;
            let v = '';
            switch (typeStr) {
                case 'number':
                case 'email':
                case 'string':
                    if (fSpec.enumFlag && fSpec.labelField != null) {
                        // jumper 2019.8.8
                        // 处理 datatype为string 和 multiChoice 为true时使用多选下拉框选择器,显示的值(国际化显示)
                        // 将所有的值替换为 selectiveItems[i].label
                        if (fSpec.multiChoice){
                            const multipleValue = t[fSpec.name].split(',');
                            if (multipleValue && multipleValue.length > 0){
                                for (let i = 0; i < multipleValue.length; i++) {
                                    for (let j = 0; j < fSpec.selectiveItems.length; j++) {
                                        if (fSpec.selectiveItems[j].value === multipleValue[i]) {
                                            multipleValue[i] = fSpec.selectiveItems[j].label;
                                        }
                                    }
                                }
                                return multipleValue.join(',');
                            }
                        }else {
                            for (let i = 0; i < fSpec.selectiveItems.length; i++) {
                                if (fSpec.selectiveItems[i].value === t[fSpec.name]) {
                                    return fSpec.selectiveItems[i].label;
                                }
                            }
                        }
                    }
                    return t[fSpec.name];
                case 'boolean':
                    if (fSpec.selectiveItems != null) {
                        for (let i = 0; i < fSpec.selectiveItems.length; i++) {
                            if (t[fSpec.name] !== null && fSpec.selectiveItems[i].value === t[fSpec.name].toString()) {
                                return fSpec.selectiveItems[i].label;
                            }
                        }
                    }
                    return t[fSpec.name];
                case 'file':
                    return t[fSpec.name] == null ? '' : (t[fSpec.name]['fileName'] == null ? '' : t[fSpec.name]['fileName']);
                case 'date':
                    if (t[fSpec.name]) {
                        return this._toolService.formatDateTime((new Date(t[fSpec.name])), fSpec.formatter);
                    } else {
                        return '';
                    }

                case 'object':
                    if (t[fSpec.name]) {
                        if (fSpec.embedded) {
                            // v = this.__convertObjectValueIntoString(t[fSpec.name], fSpec.formatter);
                            // do by jumper 2019.8.6
                            v = this._convertEmbeddedObjectIntoString(t[fSpec.name], fSpec.formatter, fSpec.componentMetaDatas);
                        } else {
                            // v = t[fSpec.name][fSpec.labelField];
                            v = this.convertObjectIntoString(t[fSpec.name], fSpec.labelField, fSpec.componentMetaDatas);
                        }
                    }
                    return v;
                case 'array':
                    if (t[fSpec.name]) {
                        for (let i = 0; i < t[fSpec.name].length; ++i) {
                            const value = this.convertObjectIntoString(t[fSpec.name][i], fSpec.labelField, fSpec.componentMetaDatas);
                            v = v + value + ',';
                            // v = v + t[fSpec.name][i][fSpec.labelField] + ',';
                        }
                    }
                    return v;
                case 'json':
                    return t[fSpec.name];
            }
            return '';
        } else {
            return 'N/A';
        }
    }

    generateModel(entity: any, modelName: string): BaseModel {
        if (entity != null) {
            return entity;
        } else {
            return new BaseModel();
        }
    }
    
    // by jumper 2019.8.6
    // 处理多层嵌套对象详情页显示问题,
    // 如果显示的第一层嵌套对象里面还有嵌套对象,那么取到最底层嵌套对象组合起来显示
    // todo 是否还有没考虑到的?mark一下
    // 这里的嵌套不是指后端对象embedded,指fspec.embedded 为true时,前端呈现问题
    private getSubFspec(fSpecs: FieldspecModel[], fspecName: string): any{
        if (fSpecs && fSpecs.length > 0) {
            for (const f of fSpecs) {
                if (f.name === fspecName) {
                    return f;
                }
            }
        }
        return null;
    }
    
    // by jumper 2019.8.6
    // 处理多层嵌套对象详情页显示问题,
    // 如果显示的第一层嵌套对象里面还有嵌套对象,那么取到最底层嵌套对象组合起来显示
    // todo 是否还有没考虑到的东西? mark一下
    // 这里的嵌套不是指后端对象embedded,指fspec.embedded 为true时,前端呈现问题
    // 源代码如下:
    // private __convertObjectValueIntoString(elmValue: any, formatter: string): string {
    //     const splitedLabel: string[] = formatter.split('${');
    //     const fieldNames: string[] = new Array<string>();
    //     if (splitedLabel.length > 0) {
    //         splitedLabel.forEach(function (s): void {
    //             if (s != null && s.length > 0) {
    //                 fieldNames.push(s.substr(0, s.indexOf('}')));
    //             }
    //         });
    //     }
    //     let value = formatter;
    //     if (fieldNames.length > 0) {
    //         fieldNames.forEach(function (s): void {
    //             value = value.replace('${' + s + '}', elmValue[s]);
    //         });
    //     }
    //     return value;
    // }
    private _convertEmbeddedObjectIntoString(elmValue: any, formatter: string, fSpecs: FieldspecModel[]): string {
        if (elmValue == null){
            return '';
        }
        const splitedLabel: string[] = formatter.split('${');
        const fieldNames: string[] = new Array<string>();
        if (splitedLabel.length > 0) {
            splitedLabel.forEach(function (s): void {
                if (s != null && s.length > 0) {
                    fieldNames.push(s.substr(0, s.indexOf('}')));
                }
            });
        }
        let value = formatter;
        if (fieldNames.length > 0) {
            for (const s of fieldNames){
                const fs = this.getSubFspec(fSpecs, s);
                if (fs == null){
                   return value;
                }
                if (fs.dataType === 'object') {
                    if (fs.embedded) {
                        const v =  this._convertEmbeddedObjectIntoString(elmValue[s], fs.formatter, fs.componentMetaDatas);
                        value = value.replace('${' + s + '}', v != null ? v : '');
                    } else {
                        value = value.replace('${' + s + '}', elmValue[s][fs.labelField] != null ? elmValue[s][fs.labelField] : '');
                    }
                }else {
                    value = value.replace('${' + s + '}', elmValue[s] != null ? elmValue[s] : '');
                }
            }
        }
        return value;
    }
    
    /**
     * 2019.8.14 jumper
     * 处理多个关联对象时字段显示labelField问题,如果存在多层关联,
     * 会取出最底层对象值,支持嵌套embedded和普通管联对象
     * 举例一个obj里有多个item对象,labelField为item里的子对象item_item,
     * 那么会继续去item_item里的labelfield为最后显示的值
     */
    convertObjectIntoString(elmValue: any, labelField: string, fSpecs: FieldspecModel[]): string {
        let value;
        if (elmValue == null){
            return '';
        }
        const fs = this.getSubFspec(fSpecs, labelField);
        if (fs == null){
            return elmValue[labelField];
        }
        if (fs.dataType === 'object') {
            if (fs.embedded) {
                value = this._convertEmbeddedObjectIntoString(elmValue[labelField], fs.formatter, fs.componentMetaDatas);
            } else {
                value = this.convertObjectIntoString(elmValue[labelField], fs.labelField, fs.componentMetaDatas);
            }
        }else {
            value = elmValue[labelField];
        }
        return value;
    }
    
    generateSeletiveItems(fSpec: FieldspecModel): SelectiveItem[] {
        if (fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            fSpec.componentMetaDatas.forEach(subfSpec => {
                subfSpec.selectiveItems = this.generateSeletiveItems(subfSpec);
            });
        }
        let selectiveItems: SelectiveItem[] = null;
        if (fSpec.enumFlag) {
            selectiveItems = new Array<SelectiveItem>();
            for (const s of fSpec.selectiveValues) {
                const ss: string[] = s.split(',');
                const selectiveItem = new SelectiveItem();
                selectiveItem.value = ss[0];
                selectiveItem.label = ss[1];
                selectiveItem.checked = false;
                selectiveItems.push(selectiveItem);
            }
        }
        if (fSpec.dataType === 'boolean') {
            selectiveItems = new Array<SelectiveItem>();
            this._translate.get('Value.true').subscribe((res: string) => {
                selectiveItems.push({ value: 'true', label: res, checked: false });
            });
            this._translate.get('Value.false').subscribe((res: string) => {
                selectiveItems.push({ value: 'false', label: res, checked: false });
            });
        }
        return selectiveItems;
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

    generateInputType(fSpec: FieldspecModel): string {
        let inputType: string = null;

        if (fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            fSpec.componentMetaDatas.forEach(subfSpec => {
                subfSpec.inputType = this.generateInputType(subfSpec);
            });
        }

        if (fSpec.enumFlag) {
            if (fSpec.multiChoice) {
                // jumper 2019.8.8
                // 添加多选下拉框选择器,在datatype为string 和 multiChoice 为true时使用
                // 数据保存的格式将会是以','隔开数据("xx,xx,xx"),可以为枚举和对象进行业务数据上的保存
                if (fSpec.dataType === 'string'){
                    inputType = 'multipleSelect';
                }else {
                    inputType = 'checkbox';
                }
            } else {
                // this is a enumeration data with single choice
                if (fSpec.selectiveItems != null) {
                    const itemLength = fSpec.selectiveItems.length;
                    if (itemLength >= APPCONSTANT.SELECTIVERSCOPE.RADIO[0] && itemLength <= APPCONSTANT.SELECTIVERSCOPE.RADIO[1]) {
                        inputType = 'radio';
                    } else if (itemLength >= APPCONSTANT.SELECTIVERSCOPE.SINGLESELECT[0] && itemLength <= APPCONSTANT.SELECTIVERSCOPE.SINGLESELECT[1]) {
                        inputType = 'singleSelect';
                    } else if (itemLength >= APPCONSTANT.SELECTIVERSCOPE.AUTOCOMPLETE[0] && itemLength <= APPCONSTANT.SELECTIVERSCOPE.AUTOCOMPLETE[1]) {
                        inputType = 'autocomplete';
                    }
                    // if (fSpec.selectiveItems.length > 3 && fSpec.selectiveItems.length < 10) {
                    //     inputType = 'singleSelect';
                    // } else if (fSpec.selectiveItems.length <= 3) {
                    //     inputType = 'radio';
                    // } else {
                    //     inputType = 'autocomplete';
                    // }
                } else {
                    inputType = 'radio';
                }
            }
        } else if (fSpec.i18nField && !fSpec.enumFlag) {
            inputType = 'textfori18n';
        } else if (fSpec.dataType === 'boolean') {
            inputType = 'radio';
        } else if (fSpec.dataType === 'date') {
            inputType = 'date';
        } else if (fSpec.dataType === 'email') {
            inputType = 'email';
        } else if (fSpec.dataType === 'file') {
            inputType = 'file';
        } else if (fSpec.dataType === 'object') {
            if (fSpec.embedded) {
                inputType = 'embedded';
            }
        } else if (fSpec.dataType === 'json') {
            inputType = 'json';
        } else {
            inputType = 'text';
        }
        return inputType;
    }

    generateUrlContext(serviceUrl: string): string {
        return environment.baseUrl + serviceUrl;
    }

    generateUploadUrl(serviceUrl: string): string {
        return environment.baseUrl + serviceUrl + 'upload';
    }

    generateTheBeforeCreationUrl(serviceUrl: string, id: number): string {
        return environment.baseUrl + serviceUrl + 'beforeCreation?id=' + id;
    }

    createModelForm(entity: BaseModel, fieldSpecs: FieldspecModel[]): FormGroup {
        const obj = {};
        fieldSpecs.forEach(fSpec => {
            obj[fSpec.name] = this.generateFieldForm(entity, fSpec);
        });
        obj['i18nResources'] = this._formBuilder.array(this._generateI18nResourceArray(entity == null ? null : entity.i18nResources));
        return this._formBuilder.group(obj);
    }

    createSearchForm(entity: BaseModel, fieldSpecs: FieldspecModel[]): FormGroup {
        const obj = {};
        fieldSpecs.forEach(fSpec => {
            obj[fSpec.name] = this.generateSearchForm(entity, fSpec);
        });
        return this._formBuilder.group(obj);
    }

    getCurrentI18nKeyFieldValue(fieldSpecs: FieldspecModel[], modelForm: FormGroup): string {
        for (const fSpec of fieldSpecs) {
            if (fSpec.i18nKeyField) {
                return modelForm.controls[fSpec.name].value;
            }
        }
        return '';
    }

    updateI18nResource(modelForm: FormGroup, fSpec: FieldspecModel, langKey: string, langValue: string, i18nKeyFieldValue: string): void {
        const i18nRes = new I18nresourceModel();
        i18nRes.languageId = langKey;
        i18nRes.i18nValue = langValue;
        i18nRes.i18nKey = fSpec.classFullName + '.' + fSpec.name + '.' + i18nKeyFieldValue;

        const controls = <FormArray>modelForm.controls['i18nResources'];
        for (let i = 0; i < controls.length; i++) {
            const resForm = controls.controls[i];
            if ((resForm.value['languageId'] === i18nRes.languageId) && (resForm.value['i18nKey'] === i18nRes.i18nKey)) {
                i18nRes.id = resForm.value['id'];
                controls.removeAt(i);
                break;
            }
        }
        controls.push(this._generateI18nResourceForm(i18nRes));
    }

    private _generateI18nResourceArray(resources: I18nresourceModel[]): FormGroup[] {
        const groups = new Array<FormGroup>();
        if (resources) {
            resources.forEach(resource => {
                groups.push(this._generateI18nResourceForm(resource));
            });
        }
        return groups;
    }

    private _generateI18nResourceForm(i18nRes: I18nresourceModel): FormGroup {
        return this._formBuilder.group({
            id: i18nRes.id,
            i18nKey: i18nRes.i18nKey,
            languageId: i18nRes.languageId,
            i18nValue: i18nRes.i18nValue
        });
    }

    generateFieldFormArray(modelForm: FormGroup, fSpec: FieldspecModel): FormArray {
        modelForm.controls[fSpec.name] = <FormArray>this._formBuilder.array([]);
        return <FormArray>modelForm.controls[fSpec.name];
    }

    private generateSearchForm(entity: BaseModel, fSpec: FieldspecModel): any {
        if (fSpec.autogenerated && fSpec.name !== 'id' && !fSpec.i18nKeyField) {
            return null;
        }
        if (fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            if (fSpec.dataType === 'object') {
                return this.createModelForm(entity[fSpec.name], fSpec.componentMetaDatas);
            }
            if (fSpec.dataType === 'array') {
                const controls = <FormArray>this._formBuilder.array([this.createModelForm(entity[fSpec.name], fSpec.componentMetaDatas)]);
                return controls;
            }
        }
        let v = '';
        if (entity != null && entity[fSpec.name] != null) {
            v = entity[fSpec.name];
        }
        if (fSpec.selectiveItems != null && fSpec.selectiveItems.length > 0) {
            this.setSelectiveItemCheckedFlag(entity, fSpec);
        }
        if (fSpec.enumFlag && fSpec.multiChoice) {
            // jumper 2019.8.8
            // 添加多选下拉框选择器,在datatype为string 和 multiChoice 为true时使用
            // 数据保存的格式将会是以','隔开数据("xx,xx,xx"),可以为枚举和对象进行业务数据上的保存
            if (fSpec.dataType !== 'string'){
                const elms = new Array<BaseModel>();
                fSpec.selectiveItems.forEach(vv => {
                    const elm = new BaseModel();
                    if (vv.checked) {
                        elm.id = Number.parseInt(vv.value, 10);
                        elms.push(elm);
                    }
                });
                return this._formBuilder.array(elms);
            }else {
                return [v];
            }
        }
        if (fSpec.dataType === 'date') {
            if (v !== '') {
                // if (fSpec.required) {
                //     return [new Date(v), [Validators.required]];
                // } else {
                return [new Date(v)];
                // }
            }
            return v;
        }
        if (fSpec.dataType === 'email') {
            // if (fSpec.required) {
            //     return [v, [Validators.required, Validators.email]];
            // } else {
            return [v, [Validators.email]];
            // }
        }
        // if (fSpec.required) {
        //     return [v, [Validators.required]];
        // } else {
        return [v];
        // }
    }

    generateFieldForm(entity: BaseModel, fSpec: FieldspecModel): any {
        if (fSpec.autogenerated && fSpec.name !== 'id' && !fSpec.i18nKeyField) {
            return null;
        }
        const validators: Validators[] = new Array<Validators>();
        if (fSpec.required) {
            validators.push(Validators.required);
        }
        if (fSpec.maxLength && fSpec.maxLength !== 0 && fSpec.maxLength != null) {
            validators.push(Validators.maxLength(fSpec.maxLength));
        }
        if (fSpec.minLength && fSpec.minLength != null) {
            validators.push(Validators.minLength(fSpec.minLength));
        }
        if (fSpec.dataType === 'number') {
            if (fSpec.maxVal && fSpec.maxVal != null) {
                validators.push(Validators.max(Number.parseInt(fSpec.maxVal, 10)));
            }
            if (fSpec.minVal && fSpec.minVal != null) {
                validators.push(Validators.min(Number.parseInt(fSpec.minVal, 10)));
            }
        }

        if (fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            if (fSpec.dataType === 'object') {
                // 备注byjumper 2019.8.6:修复不支持多层嵌套编辑的bug(2层以上)
                // fix当entity[fSpec.name] == null 时的报错导致嵌套多层<field-form>时,页面显示失败
                if (entity[fSpec.name] == null){
                    entity[fSpec.name] = new BaseModel();
                }
                return this.createModelForm(entity[fSpec.name], fSpec.componentMetaDatas);
            }
            if (fSpec.dataType === 'array') {
                if (entity != null && entity[fSpec.name] != null && entity[fSpec.name].length > 0) {
                    const controls = <FormArray>this._formBuilder.array([this.createModelForm(entity[fSpec.name][0], fSpec.componentMetaDatas)]);
                    for (let i = 1; i < entity[fSpec.name].length; i++) {
                        controls.push(this.createModelForm(entity[fSpec.name][i], fSpec.componentMetaDatas));
                    }
                    return controls;
                }
                return null;
            }
        }
        let v = '';
        if (entity != null && entity[fSpec.name] != null) {
            v = entity[fSpec.name];
        }
        if (fSpec.selectiveItems != null && fSpec.selectiveItems.length > 0) {
            this.setSelectiveItemCheckedFlag(entity, fSpec);
        }
        if (fSpec.enumFlag && fSpec.multiChoice) {
            // jumper 2019.8.8
            // 添加多选下拉框选择器,在datatype为string 和 multiChoice 为true时使用
            // 数据保存的格式将会是以','隔开数据("xx,xx,xx"),可以为枚举和对象进行业务数据上的保存
            if (fSpec.dataType !== 'string'){
                const elms = new Array<BaseModel>();
                fSpec.selectiveItems.forEach(vv => {
                    const elm = new BaseModel();
                    if (vv.checked) {
                        elm.id = Number.parseInt(vv.value, 10);
                        elms.push(elm);
                    }
                });
                return this._formBuilder.array(elms);
            }
        }
        if (fSpec.dataType === 'date') {
            if (v !== '') {
                return [new Date(v), validators];
                // if (fSpec.required) {
                //     return [new Date(v), [Validators.required]];
                // } else {
                //     return [new Date(v)];
                // }
            }
            return v;
        }
        if (fSpec.dataType === 'email') {
            validators.push(Validators.email);
            return [v, validators];
            // if (fSpec.required) {
            //     return [v, [Validators.required, Validators.email]];
            // } else {
            //     return [v, [Validators.email]];
            // }

        }

        return [v, validators];
        // if (fSpec.required) {
        //     return [v, [Validators.required,fSpec.maxLength != null?Validators.maxLength(10):'',]];
        // } else {
        //     return [v];
        // }
    }

    setSelectiveItemCheckedFlag(entity: BaseModel, fSpec: FieldspecModel): void {
        if (entity && entity[fSpec.name] != null) {
            fSpec.selectiveItems.forEach(selectiveItem => {
                const dataType: string = fSpec.dataType;
                if (dataType === 'array') {
                    selectiveItem.checked = this._containValue(entity[fSpec.name], selectiveItem.value);
                } else if (dataType === 'object') {
                    selectiveItem.checked = (entity[fSpec.name].id === Number.parseInt(selectiveItem.value, 10));
                } else if (dataType === 'boolean') {
                    selectiveItem.checked = ((entity[fSpec.name] + '') === selectiveItem.value);
                } else {
                    if (entity[fSpec.name] && entity[fSpec.name].length > 0) {
                        selectiveItem.checked = (entity[fSpec.name] === selectiveItem.value
                            || entity[fSpec.name] === selectiveItem.label);
                    }
                }
            });
        }
    }

    getFieldResources(entity: BaseModel, fSpec: FieldspecModel, fSpecs: FieldspecModel[]): I18nresourceModel[] {
        if (fSpec.componentMetaDatas && fSpec.componentMetaDatas.length > 0) {
            fSpec.componentMetaDatas.forEach(subfSpec => {
                if (entity[fSpec.name] != null) {
                    if (fSpec.dataType === 'array') {
                        if (entity[fSpec.name].length > 0) {
                            for (const subEntity of entity[fSpec.name]) {
                                subfSpec.i18nResourcesForField = this.getFieldResources(subEntity, subfSpec, fSpec.componentMetaDatas);
                            }
                        }
                    } else if (fSpec.dataType === 'object') {
                        subfSpec.i18nResourcesForField = this.getFieldResources(entity[fSpec.name], subfSpec, fSpec.componentMetaDatas);
                    }
                }
            });
        }

        if (fSpec.enumFlag || !entity || !fSpec.i18nField) {
            return;
        }
        let res: I18nresourceModel[] = null;
        if (entity.fieldI18nResources) {
            let hasI18nKey = false;
            for (let i = 0; i < entity.fieldI18nResources.length; i++) {
                if (entity.fieldI18nResources[i][0] === this._getI18nKey(entity, fSpec, fSpecs)) {
                    res = entity.fieldI18nResources[i][1];
                    hasI18nKey = true;
                }
            }
            if (!hasI18nKey) {
                res = new Array<I18nresourceModel>();
                entity.fieldI18nResources.push([this._getI18nKey(entity, fSpec, fSpecs), res]);
            }
        } else {
            entity.fieldI18nResources = new Array<[string, I18nresourceModel[]]>();
            entity.fieldI18nResources.push([this._getI18nKey(entity, fSpec, fSpecs), new Array<I18nresourceModel>()]);
            res = entity.fieldI18nResources[0][1];
        }
        return res;
    }

    private _getI18nKey(e: BaseModel, f: FieldspecModel, fSpecs: FieldspecModel[]): string {
        let i18nKeyField: string = null;
        let i18nKeyFieldValue = 'pending';
        const curFms = fSpecs;
        for (let i = 0; i < curFms.length; i++) {
            if (curFms[i].i18nKeyField) {
                i18nKeyField = curFms[i].classFullName + '.' + f.name;
                if (e[curFms[i].name]) {
                    i18nKeyFieldValue = e[curFms[i].name];
                }
                break;
            }
        }
        if (i18nKeyField != null) {
            return i18nKeyField + '.' + i18nKeyFieldValue;
        }
        return null;
    }

    splitI18nResources(entity: BaseModel, i18nResources: I18nresourceModel[], fSpecs: FieldspecModel[]): void {
        if (!i18nResources || i18nResources.length === 0) {
            // do not have resource in the entity
            return;
        }
        // it could be multiple fields with i18n resource, so we split into different field.
        entity.fieldI18nResources = new Array<[string, I18nresourceModel[]]>();
        const i18nKeys: string[] = new Array<string>();
        for (let i = 0; i < i18nResources.length; i++) {
            if (!i18nKeys.includes(i18nResources[i].i18nKey)) {
                i18nKeys.push(i18nResources[i].i18nKey);
            }
        }

        for (let j = 0; j < i18nKeys.length; j++) {
            const i18nValues: I18nresourceModel[] = new Array<I18nresourceModel>();
            for (let i = 0; i < i18nResources.length; i++) {
                if (i18nResources[i].i18nKey === i18nKeys[j]) {
                    i18nValues.push(i18nResources[i]);
                }
            }
            entity.fieldI18nResources.push([i18nKeys[j], i18nValues]);
        }

        for (let i = 0; i < fSpecs.length; i++) {
            if (fSpecs[i].componentMetaDatas && fSpecs[i].componentMetaDatas.length > 0 && entity[fSpecs[i].name]) {
                if (fSpecs[i].dataType !== 'array') {
                    this.splitI18nResources(entity[fSpecs[i].name],
                        entity[fSpecs[i].name].i18nResources, fSpecs[i].componentMetaDatas);
                } else {
                    for (let j = 0; j < entity[fSpecs[i].name].length; j++) {
                        this.splitI18nResources(entity[fSpecs[i].name][j],
                            entity[fSpecs[i].name][j].i18nResources, fSpecs[i].componentMetaDatas);
                    }
                }
            }
        }
    }
}
