import { Component, forwardRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseModel } from 'app/model/base.model';
import { FieldspecModel } from 'app/model/fieldspec.model';
import { ModelspecModel } from 'app/model/modelspec.model';
import { ViewFieldSpecModel } from 'app/model-view/model-view.model';
import { ModelService } from 'app/service/model.service';
import { appRuntimePara } from 'app/app-runtime-para';
import { APPCONSTANT } from 'app/app-constants';
import { ModelListComponent } from 'app/model-view/list/model-list.component';
import { SearchspecModel } from 'app/model/searchspec.model';
import { UserconfigModel } from 'app/model/userconfig.model';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UseraccountModel } from 'app/model/useraccount.model';


@Component({
    selector: 'model-view',
    templateUrl: './model-view.component.html',
    styleUrls: ['./model-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ModelViewComponent implements OnInit, OnDestroy {

    viewType = 'list'; // 可以是：list, detail 和 edit
    fieldSpecs: Array<FieldspecModel>;
    modelSpec: ModelspecModel;

    // 当一个业务模型及其子类具有如下条件的时候，从服务器得到的是一组业务模型说明：
    // 1. 该业务模型和其子类统一管理
    // 2. 子类的属性都是保存在父类的jsonFields属性中的
    // 这个属性要传递给model-list组件，
    modelSpecs: ModelspecModel[];
    // 这个是从modelSpecs中选择出来的业务模型的模型说明
    selectedModelSpec: ModelspecModel;
    selectedModelFieldSpecs: FieldspecModel[];

    serviceUrl: string;
    modelName: string;
    selectedEntityId: number;
    selectedEntity: BaseModel;
    searchFieldSpecs: ViewFieldSpecModel;
    searchCriteria: BaseModel;
    showAdvanceSearchArea = false;
    expandIcon = 'expand_more';
    expandText: string;
    showColumns: string;
    searchParams: string;
    saveSetting: string;
    private _unsubscribeAll: Subject<any>;
    searchInput: FormControl;

    // 隐藏掉一些现在不能搜索的属性，待优化
    canSearchSpecs: Array<FieldspecModel>;
    // 和子组件交互的form
    searchModelForm: FormGroup = null;
    // 控制选择框
    searchCheckbox: FormControl;
    // 选择框选中的节点
    searchFields: Array<FieldspecModel>;
    // 可进行选择的字段名数组
    canSearchList: Array<SearchspecModel>;
    // 选中的字段名数组
    searchFieldNames: string[];
    // 和子组件交互的entity，在子组件create form
    entity: BaseModel;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    // 调用子组件
    @ViewChild(forwardRef(() => ModelListComponent), { static: false })
    modellist: ModelListComponent;

    displayForm: FormControl = new FormControl('');
    columnsToDisplay: string[] = new Array<string>();
    initialColumns = ['buttons', 'checkbox'];

    constructor(private _route: ActivatedRoute, private _translate: TranslateService,
        private _cookieService: CookieService, private _modelService: ModelService,
        private _matDialog: MatDialog, ) {
        this.searchInput = new FormControl('');
        this.searchCheckbox = new FormControl('');
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        const that = this;
        this._route.params.subscribe((params) => {
            that.serviceUrl = params.modelname === '' ? that.serviceUrl : '/' + params.modelname + 's/';
            that.modelName = params.modelname === '' ? that.modelName : params.modelname;
            that.modelSpec = null;
            that._init();
        });
    }

    private _init(): void {
        const that = this;
        this.viewType = 'list';
        this._cookieService.delete(APPCONSTANT.COOKIENAME.CURRENT_PAGE);
        this._modelService.fetchMetadata(this.serviceUrl).then(mSpecs => {
            if (mSpecs && mSpecs.length > 0) {
                // that.fieldSpecs.sort(FieldspecModel.sortTableHeader);
                mSpecs.forEach(mSpec => {
                    that._sortFieldSpecs(mSpec.fieldSpecs);
                    that._handleMetaDatas(mSpec.fieldSpecs, true, null);
                });
                that.fieldSpecs = mSpecs[0].fieldSpecs;
                that.modelSpec = mSpecs[0];
                that.modelSpecs = mSpecs;
            }

            // console.log(this.fieldSpecs);
            // console.log(this.viewFieldSpecs);
            // 初始化时讲可以进行高级搜索的field放到选择器中
            if (that.fieldSpecs != null) {
                that.canSearchSpecs = new Array<FieldspecModel>();
                that.canSearchList = new Array<SearchspecModel>();
                for (const fSpec of that.fieldSpecs) {
                    // todo 现在高级搜索，暂时不支持范围搜索，先mark起来，后续优化
                    if (fSpec.searchType !== 'NONE') {
                        if (fSpec.dataType === 'object' || fSpec.dataType === 'array') {
                            if (fSpec.embedded) {
                                const sSpec = new SearchspecModel();
                                sSpec.name = fSpec.name;
                                sSpec.label = fSpec.label;
                                that.canSearchList.push(sSpec);
                            } else {
                                // 支持往下一层子类进行搜索
                                const componentMetaDatas = fSpec.componentMetaDatas;
                                if (componentMetaDatas) {
                                    for (const cSpec of componentMetaDatas) {
                                        if (cSpec.searchType !== 'NONE') {
                                            const sSpec = new SearchspecModel();
                                            sSpec.name = fSpec.name + '.' + cSpec.name;
                                            sSpec.label = fSpec.label + '.' + cSpec.label;
                                            that.canSearchList.push(sSpec);
                                        }
                                    }
                                }
                            }
                        } else {
                            const sSpec = new SearchspecModel();
                            sSpec.name = fSpec.name;
                            sSpec.label = fSpec.label;
                            that.canSearchList.push(sSpec);
                        }
                        that.canSearchSpecs.push(fSpec);
                    }
                }

                that.fieldSpecs.forEach(fSpec => {
                    if (!fSpec.hide) {
                        that.columnsToDisplay.push(fSpec.name);
                    }
                });
            }
            that.displayForm.setValue(that.columnsToDisplay);
            // 初始化一个空的表单
            that.entity = new BaseModel();
            that.searchModelForm = that._modelService.createSearchForm(that.entity, new Array<FieldspecModel>());
            that.showColumns = that._translate.instant('Model.label.showColumns');
            that.searchParams = that._translate.instant('Model.label.searchParams');
            that.saveSetting = that._translate.instant('Model.label.saveSetting');
        });
    }

    isTabContainer(modelSpec: ModelspecModel): boolean {
        if (modelSpec.tabListValues && modelSpec.tabListValues.length > 0) {
            return true;
        }
        return false;
    }

    generateTabLabel(tabValue: string): string {
        return tabValue;
    }

    private _sortFieldSpecs(fss: Array<FieldspecModel>): void {
        if (fss == null) {
            return;
        }
        fss.sort(FieldspecModel.sortTableHeader);
        for (const fs of fss) {
            if (fs.componentMetaDatas != null) {
                this._sortFieldSpecs(fs.componentMetaDatas);
            }
        }
    }

    hasAdvanceSearch(): boolean {
        if (!this.canSearchSpecs) {
            return false;
        }
        this.expandText = this._translate.instant('Model.label.show.advance');
        return (this.canSearchSpecs != null);
    }

    showHideSearchCriteriaArea(): void {
        this.showAdvanceSearchArea = !this.showAdvanceSearchArea;
        if (this.showAdvanceSearchArea) {
            this.expandIcon = 'expand_less';
            this.expandText = this._translate.instant('Model.label.hide.advance');
        } else {
            this.expandIcon = 'expand_more';
            this.expandText = this._translate.instant('Model.label.show.advance');
        }
    }

    getSearchFieldLabel(fieldName: string): string {
        const fNames = fieldName.split(',');
        let searchLabel = '';
        for (const fName of fNames) {
            searchLabel = searchLabel + this._getSearchFieldLabel(this.fieldSpecs, fName.trim());
        }
        return searchLabel.substr(0, searchLabel.length - 1);
    }

    private _getSearchFieldLabel(fSpecs: FieldspecModel[], fName: string): string {
        let searchLabel = '';
        if (fName === null || fName.length === 0) {
            return searchLabel;
        }
        if (fName.indexOf('.') === -1) {
            for (const fSpec of fSpecs) {
                if (fSpec.name === fName) {
                    return fSpec.label + '/';
                }
            }
        } else {
            const attrName = fName.substring(0, fName.indexOf('.'));
            for (const fSpec of fSpecs) {
                if (fSpec.name === attrName) {
                    searchLabel = fSpec.label + '.' + this._getSearchFieldLabel(fSpec.componentMetaDatas,
                        fName.substring(fName.indexOf('.') + 1));
                }
            }
        }
        return searchLabel;
    }
    onKeyPress(event: any, searchElm: any): void {
        if (event.keyCode === 13) {
            this.onSearch(searchElm);
        }
    }

    onFocus(searchElm: any): void {
        searchElm.setSelectionRange(0, this.searchInput.value.length);
    }

    onSearch(searchElm: any): void {
        const searchText = this.searchInput.value;
        // if (this.searchCriteria == null) {
        this.searchCriteria = this._generateCriteria(searchText);
        // }
        this.searchCriteria.smartSearchText = searchText;
        searchElm.setSelectionRange(0, this.searchInput.value.length);
        this.modellist.searchCriteria = this.searchCriteria;
        // this.viewType = 'list';
        this.modellist.onPageChange(this.modellist.currentPage, this.modellist.pageSize);
    }

    private _generateCriteria(searchText: string): BaseModel {
        const cri = new BaseModel();
        const fNames = this.modelSpec.searchField.split(',');
        for (const fName of fNames) {
            const attrNames = fName.trim().split('.');
            if (attrNames == null || attrNames.length === 0) {
                return cri;
            }
            let m = cri;
            for (let i = 0; i < attrNames.length - 1; i++) {
                m[attrNames[i]] = new BaseModel();
                m = m[attrNames[i]];
            }
            m[fName.substr(fName.lastIndexOf('.') + 1)] = searchText;
        }
        return cri;
    }


    onAdvanceSearch(searchElm: any): void {
        this.searchCriteria = new BaseModel();
        const formEntity = this.searchModelForm.getRawValue();
        this.searchCriteria = Object.assign(this.searchCriteria, formEntity);
        this.modellist.searchCriteria = this.searchCriteria;
        this.modellist.onPageChange(this.modellist.currentPage, this.modellist.pageSize);
    }

    onChangeShowColumns(event: any): void {
        const selectList = new Array<string>();
        if (this.modelSpec && (this.modelSpec.batchDeletable || this.modelSpec.downloadable)) {
            this.initialColumns.forEach(e => {
                selectList.push(e);
            });
        } else {
            selectList.push(this.initialColumns[0]);
        }
        const valueList = event.value;
        if (valueList && valueList.length > 0) {
            valueList.forEach(e => {
                selectList.push(e);
            });
        }
        this.modellist.columnsToDisplay = selectList;
    }

    onSaveDisplayColumns(event: any): void {
        // 选择器失焦时进行保存用户选择方案
        // console.log(this.displayForm.value);
        const selectList = new Array<string>();
        const valueList = this.displayForm.value;
        if (valueList && valueList.length > 0) {
            valueList.forEach(e => {
                selectList.push(e);
            });
        }
        let hiddenStr = '';
        this.fieldSpecs.forEach(fSpec => {
            if (!selectList.includes(fSpec.name)) {
                hiddenStr += fSpec.name + ',';
            }
        });
        if (hiddenStr !== '') {
            hiddenStr.substr(hiddenStr.length - 1, hiddenStr.length);
        }
        const currentUserAccount = appRuntimePara.currentLoginUser;
        const userSetting: UserconfigModel = currentUserAccount.userSetting;
        const hiddenFields = userSetting.tableHiddenFields;
        if (userSetting && hiddenStr) {
            try {
                let hiddenFieldMap = JSON.parse(hiddenFields);
                if (hiddenFieldMap == null) {
                    hiddenFieldMap = new Object();
                }
                const modelName: string = this.modelSpec.className.substr(this.modelSpec.className.lastIndexOf('.') + 1);
                if (hiddenFieldMap[modelName] && hiddenFieldMap[modelName] != null) {
                    hiddenFieldMap[modelName] = hiddenStr;
                } else {
                    hiddenFieldMap[modelName] = new Object();
                    hiddenFieldMap[modelName] = hiddenStr;
                }
                const hideFieldJson = JSON.stringify(hiddenFieldMap);
                userSetting.tableHiddenFields = hideFieldJson;
            } catch (e) {

            }
        }
        this._saveConfigWithConfirmation(currentUserAccount);
    }

    private _saveConfigWithConfirmation(useraccountModel?: UseraccountModel): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, { disableClose: false });
        this.confirmDialogRef.componentInstance.confirmTitle = this._translate.instant('Confirm.title.save');
        this.confirmDialogRef.componentInstance.confirmMessage = this._translate.instant('Confirm.content.save');
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._modelService.saveEntity('/useraccounts/', useraccountModel).then(() => {
                });
            }
            this.confirmDialogRef = null;
        });
    }

    onFormChanged(e: any): void {
        // const formEntity = this.searchModelForm.getRawValue();
    }


    onSelectionChanged(event: any): void {
        const selectList = event.value;
        this.entity = new BaseModel();
        this.searchFields = new Array<FieldspecModel>();
        this.searchFieldNames = new Array<string>();
        // 这里的目的是将选择器的对应的FieldspecModel,封装起来，把无用的属性去掉
        // todo 这里进行选择生成表单时，已填写的信息需要重新生成有信息的表单，这里还没实现
        // 所以现在每次变更帅选条件都重新生成新的搜索表单
        if (selectList && selectList.length > 0) {
            for (let i = 0; i < selectList.length; i++) {
                let fSpec = new FieldspecModel();
                let indexSelect = null;
                if (selectList[i].indexOf('.') >= 0) {
                    const objAttrs = selectList[i].split('.');
                    indexSelect = this.getIndexfSpec(this.canSearchSpecs, objAttrs[0]);
                    fSpec = this.canSearchSpecs[indexSelect];
                    const indexSpec = this.getIndexfSpec(this.searchFields, fSpec.name);
                    const indexcMeteData = this.getIndexfSpec(fSpec.componentMetaDatas, objAttrs[1]);
                    if (indexcMeteData != null) {
                        const metaData = fSpec.componentMetaDatas[indexcMeteData];
                        if (indexSpec != null) {
                            const componentMetaDatas = this.searchFields[indexSpec].componentMetaDatas;
                            if (componentMetaDatas != null) {
                                this.searchFields[indexSpec].componentMetaDatas.push(fSpec.componentMetaDatas[indexcMeteData]);
                            } else {
                                this.searchFields[indexSpec].componentMetaDatas = new Array<FieldspecModel>();
                                this.searchFields[indexSpec].componentMetaDatas.push(fSpec.componentMetaDatas[indexcMeteData]);
                            }
                        } else {
                            const sSpec: FieldspecModel = Object.assign({}, fSpec);
                            sSpec.componentMetaDatas = new Array<FieldspecModel>();
                            sSpec.componentMetaDatas.push(metaData);
                            this.searchFields.push(sSpec);
                        }
                    }

                } else {
                    indexSelect = this.getIndexfSpec(this.canSearchSpecs, selectList[i]);
                    fSpec = this.canSearchSpecs[indexSelect];
                    const sSpec: FieldspecModel = Object.assign({}, fSpec);
                    this.searchFields.push(sSpec);
                }
                this.searchFieldNames.push(selectList[i]);
            }
        }
        // 生成选择器筛选的对应表单
        this.searchModelForm = this._modelService.createSearchForm(this.entity, this.searchFields);
    }


    getIndexfSpec(searchFields: FieldspecModel[], fSpecName: string): any {
        for (let i = 0; i < searchFields.length; i++) {
            if (searchFields[i].name === fSpecName) {
                return i;
            }
        }
        return null;
    }

    // selectAll(searchAll: any): void{
    //     this.searchFields = this.fieldSpecs;
    //     this.searchFieldNames = new Array<String>();
    //     for (const fSpec of this.fieldSpecs) {
    //         this.searchFieldNames.push(fSpec.name);
    //     }
    //
    // }

    onEntityIdChanged(entityIdAction: number): void {
        this.selectedEntityId = entityIdAction[0];
        this.selectedModelSpec = null;
        this.selectedModelFieldSpecs = null;
        this.viewType = entityIdAction[1];
        this.selectedEntity = entityIdAction[2];
        if (this.modelSpecs && this.modelSpecs.length > 1
            && this.selectedEntity.entityName != null
            && this.selectedEntity.entityName.length > 0) {
            this.modelSpecs.forEach(mSpec => {
                if (mSpec.className.endsWith(this.selectedEntity.entityName)) {
                    this.selectedModelSpec = mSpec;
                    this.selectedModelFieldSpecs = mSpec.fieldSpecs;
                }
            });
        }
    }

    onDetailBackAction(): void {
        this.viewType = 'list';
    }

    fetchModelSpec(): ModelspecModel {
        if (this.selectedModelSpec != null) {
            return this.selectedModelSpec;
        } else {
            return this.modelSpec;
        }
    }

    fetchFieldSpecs(): FieldspecModel[] {
        if (this.selectedModelFieldSpecs != null && this.selectedModelFieldSpecs.length > 0) {
            return this.selectedModelFieldSpecs;
        } else {
            return this.fieldSpecs;
        }
    }

    private _handleMetaDatas(_fieldSpecs: Array<FieldspecModel>, isModelField: boolean, parentFieldSpec: FieldspecModel): void {
        let hiddenFields = '';
        if (appRuntimePara.currentLoginUser.userSetting && appRuntimePara.currentLoginUser.userSetting.tableHiddenFields) {
            try {
                const hiddenFieldMap = JSON.parse(appRuntimePara.currentLoginUser.userSetting.tableHiddenFields);
                const modelName: string = this.modelSpec.className.substr(this.modelSpec.className.lastIndexOf('.') + 1);
                hiddenFields = hiddenFieldMap[modelName];
                if (!hiddenFields) {
                    hiddenFields = '';
                } else {
                    hiddenFields += ',';
                }
            } catch (e) {

            }
        }
        for (const fSpec of _fieldSpecs) {
            fSpec.parentFieldSpecification = parentFieldSpec;
            if (hiddenFields.indexOf(fSpec.name + ',') !== -1) {
                fSpec.hide = true;
            }
            fSpec.selectiveItems = this._modelService.generateSeletiveItems(fSpec);
            fSpec.hideComponent = true;
            fSpec.isValid = true;
            if (fSpec.componentMetaDatas) {
                this._handleMetaDatas(fSpec.componentMetaDatas, false, fSpec);
            }
            fSpec.clearSearchCondition = false;
        }
    }
}
