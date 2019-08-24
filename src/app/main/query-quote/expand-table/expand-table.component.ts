import {Component, ViewEncapsulation, OnInit, Input} from '@angular/core';
import {BaseModel} from '../../../model/base.model';
import {MatDialog, MatDialogRef} from '@angular/material';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {ModelService} from '../../../service/model.service';
import {MessageService} from '../../../message/message.service';
import {QuoteDialogComponent} from './quote-dialog/quote-dialog.component';
import {FieldspecModel} from '../../../model/fieldspec.model';
import {ModelspecModel} from '../../../model/modelspec.model';
import {PlaceOrderDialogComponent} from './placeOrder/place-order-form.component';
import {FunctionalityModel} from '../../../model/functionality.model';
import {EditFeeItemComponent} from './editFeeItem/edit-fee-item.component';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {QuoteSchemeModel} from '../../../model/quotescheme.model';
import {QuoteChargeItem} from '../../../model/quotechargeitem.model';
import {SetBubbleRateComponent} from './setBubbleRate/set-bubble-rate.component';
import {ToolService} from '../../../service/tool.service';
import {RestfulService} from '../../../service/restful.service';
import {QuoteSpecialFee} from '../../../model/quotespecialfee.model';


// fixme 表头和数据显示字段暂时不做国际化和可配置,先hasdcode把逻辑页面做出来,跑通后再优化
@Component({
    selector: 'expand-table',
    templateUrl: './expand-table.component.html',
    styleUrls: ['./expand-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    styles: ['.mat-expansion-panel-body{padding: 0 24px 8px!important;}']
})
export class ExpandTableComponent  implements OnInit{
    
    @Input()
    entities: QuoteSchemeModel[];
    selectedEntityIds: number[] = new Array<number>();
    selectedChargeItemIds: number[] = new Array<number>();
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;
    showLoading = false;
    
    searchCriteria: BaseModel;
    
    @Input()
    serviceUrl: string;
    
    @Input()
    fieldSpecs: Array<FieldspecModel>;
    
    @Input()
    modelSpec: ModelspecModel;
    // for paging begin
    totalRecords = 0;
    currentPage = 1;
    pageSize = 10; // we use different initial value for reproducing bug easily.
    totalPages = 0;
    pageSizeValues: number[] = [10, 25, 50, 100];
    // for paging end
    @Input()
    tabValue: string;
    chargeType: string[];
    schemeObj: object;
    queryObj: object;
    specialFeeObj: object;
    
    constructor( private _translate: TranslateService,
                 private _cookieService: CookieService,
                 private _modelService: ModelService,
                 private _matDialog: MatDialog,
                 private _msgService: MessageService,
                 private _toolService: ToolService,
                 private http: RestfulService) {
            
    }
    
    ngOnInit(): void {
        this.chargeType = ['FreightRate', 'AviationCompanyLocalChargeRate', 'AirportWarehouseLocalChargeRate',
            'AirportLocalChargeRate', 'FreightSubChargeRate', 'InHouseLocalChargeRate', 'PickupChargeRate', 'TransferChargeRate'];
        this.schemeObj = new Object();
        for (const item of this.fieldSpecs){
            item.selectiveItems = this._modelService.generateSeletiveItems(item);
            this.schemeObj[item.name] = new Object();
            this.schemeObj[item.name] = Object.assign(item);
            if (item.name === 'queryCondition'){
                this.queryObj = new Object();
                for (const c of item.componentMetaDatas){
                    this.queryObj[c.name] = new Object();
                    this.queryObj[c.name] =  Object.assign(c);
                }
            }else if (item.name === 'quoteSpecialFees'){
                this.specialFeeObj = new Object();
                for (const d of item.componentMetaDatas){
                    this.specialFeeObj[d.name] = new Object();
                    this.specialFeeObj[d.name] = Object.assign(d);
                }
            }
        }
        this.onPageChange(this.currentPage, this.pageSize);
    }
    
    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName?: string): string {
        return this._modelService.getFieldValue(e, fSpec, fieldName);
    }
    
    /* ------------ 批处理选择方案相关方法-------------*/
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
    /* ------------ 批处理选择方案相关方法-------------*/
    
    /**
     * 条件查询
     */
    onPageChange(currentPage: number, pageSize: number, elm?: any): void {
        this.showLoading = true;
        let cri: BaseModel = this.searchCriteria;
        // console.log(this.searchCriteria);
        if (!cri) {
            cri = new BaseModel();
        }
        if (this.totalPages !== 0 && (currentPage > this.totalPages)) {
            cri.pageIndex = 1;
        } else {
            cri.pageIndex = currentPage;
        }
        this.pageSize = pageSize;
        cri.curPageSize = pageSize;
        cri.sortField = this.modelSpec.indexField;
        cri.sortDesc = this.modelSpec.indexSortDesc;
        this._modelService.fetchEntities(this.serviceUrl, cri).then(pageResp => {
            if (pageResp.dataList != null){
                this.entities = pageResp.dataList;
            }
            this.currentPage = pageResp.currentPageIndex + 1;
            this.totalRecords = pageResp.totalRecords;
            this.totalPages = pageResp.totalPages;
            if (elm) {
                elm.value = this.currentPage;
            }
            this.showLoading = false;
            this.dealWithTotal(this.entities);
        });
    }
    
    /**
     * 对方案里的选择的运费等级,进行总费用的计算
     * @param isChecked
     * @param selectItem
     * @param entity
     */
    onChargeItemSelect(isChecked: boolean, selectItem: QuoteChargeItem, entity: QuoteSchemeModel): void {
        let total = 0;
        let totalCurrency = null;
        let levelWeight = 0;
        const quoteChargeItem: QuoteChargeItem[] = entity.quoteChargeItem;
        if (quoteChargeItem && quoteChargeItem.length > 0){
            totalCurrency = quoteChargeItem[0].unitPriceInfo.unitPrice.currency;
            const newItemList = quoteChargeItem.filter(item => {
                if (item.chargeRateItem.chargeRateCategory.code === 'FreightRate'){
                    item.quoteFreightFee.isCheck = false;
                    item.itemTotal = null;
                }else if (item.chargeRateItem.chargeRateCategory.code !== 'FreightRate'){
                    return item;
                }
            });
            if (isChecked) {
                selectItem.quoteFreightFee.isCheck = true;
                levelWeight = Number.parseInt(selectItem.quoteFreightFee.code.replace('+', ''), 0);
                newItemList.push(selectItem);
            }
    
            const grossWeight = entity.queryCondition.weight.value;
            let volumeWeight: number;
            if (entity.queryCondition.volume.unit === 'M'){
                volumeWeight = entity.queryCondition.volume.value * 167;
            }else {
                volumeWeight = entity.queryCondition.volume.value / 6000;
            }
            let chargeWeight: number;
            let maxLevel: number;
            let costWight: number;
            chargeWeight = (grossWeight > volumeWeight) ? grossWeight : volumeWeight;
            maxLevel = (grossWeight > levelWeight) ? grossWeight : levelWeight;
            if (chargeWeight >= maxLevel){
                costWight = maxLevel + ((chargeWeight - maxLevel) * (1 - entity.bubbleRate));
            }else {
                costWight = maxLevel;
            }
            entity.chargeWeight = chargeWeight;
            entity.costWeight = costWight;
            entity.levelWeight = levelWeight;
    
            const quoteSpecialFees: QuoteSpecialFee[] = entity.quoteSpecialFees;
            for (const c of newItemList){
                if (quoteSpecialFees && quoteSpecialFees.length > 0){
                    for (const q of quoteSpecialFees){
                        if (q.feeItems.includes(c.chargeRateItem.code)){
                            q.hasExist = true;
                            c.hasDiscount = true;
                        }
                    }
                }
            }
            total += this.getChargeItemTotal(newItemList, chargeWeight, maxLevel, costWight);
            total += this.getSpecialItemTotal(quoteSpecialFees, chargeWeight, maxLevel, costWight);
        }
        entity.totalCurrency = totalCurrency;
        entity.total = Number.parseFloat(total.toFixed(2));
    }
    
    // 初始化保存的方案的总费用
    private dealWithTotal(entities: QuoteSchemeModel[]): void{
        if (entities && entities.length > 0){
            entities.forEach(entity => {
                let total = 0;
                let totalCurrency = null;
                let levelWeight = 0;
                let firstFreight = true;
                const quoteChargeItem: QuoteChargeItem[] = entity.quoteChargeItem;
                if (quoteChargeItem && quoteChargeItem.length > 0){
                    totalCurrency = quoteChargeItem[0].unitPriceInfo.unitPrice.currency;
                    const newItemList = quoteChargeItem.filter(item => {
                        if (item.chargeRateItem.chargeRateCategory.code === 'FreightRate'){
                            // 默认初始化选中第一条运费项,并设置ischeck 为true,否则初始化为false
                            if (firstFreight) {
                                    item.quoteFreightFee.isCheck = true;
                                    levelWeight = Number.parseInt(item.quoteFreightFee.code.replace('+', ''), 0);
                                    firstFreight = false;
                                    return item;
                                }else {
                                    item.quoteFreightFee.isCheck = false;
                                }
                      
                        }else if (item.chargeRateItem.chargeRateCategory.code !== 'FreightRate'){
                            return item;
                        }
                    });
    
                    const grossWeight = entity.queryCondition.weight.value;
                    let volumeWeight: number;
                    if (entity.queryCondition.volume.unit === 'M'){
                        volumeWeight = entity.queryCondition.volume.value * 167;
                    }else {
                        volumeWeight = entity.queryCondition.volume.value / 6000;
                    }
                    let chargeWeight: number;
                    let maxLevel: number;
                    let costWight: number;
                    chargeWeight = (grossWeight > volumeWeight) ? grossWeight : volumeWeight;
                    maxLevel = (grossWeight > levelWeight) ? grossWeight : levelWeight;
                    if (chargeWeight >= maxLevel){
                        costWight = maxLevel + ((chargeWeight - maxLevel) * (1 - entity.bubbleRate));
                    }else {
                        costWight = maxLevel;
                    }
                    entity.chargeWeight = chargeWeight;
                    entity.costWeight = costWight;
                    entity.levelWeight = levelWeight;
    
                    const quoteSpecialFees: QuoteSpecialFee[] = entity.quoteSpecialFees;
                    for (const c of newItemList){
                        if (quoteSpecialFees && quoteSpecialFees.length > 0){
                            for (const q of quoteSpecialFees){
                                if (q.feeItems.includes(c.chargeRateItem.code)){
                                    q.hasExist = true;
                                    c.hasDiscount = true;
                                }
                            }
                        }
                    }
                    total += this.getChargeItemTotal(newItemList, chargeWeight, maxLevel, costWight);
                    total += this.getSpecialItemTotal(quoteSpecialFees, chargeWeight, maxLevel, costWight);
                }
                entity.totalCurrency = totalCurrency;
                entity.total = Number.parseFloat(total.toFixed(2));
            });
        }
        
    }
    
    /**
     * 这个方法是为了在弹出的查询窗口更改分泡比时,自动更新该条方案的总费用
     */
    private dealWithThisTotal(entity: QuoteSchemeModel): void{
        let total = 0;
        let totalCurrency = null;
        let levelWeight = 0;
        let firstFreight = true;
        const quoteChargeItem: QuoteChargeItem[] = entity.quoteChargeItem;
        if (quoteChargeItem && quoteChargeItem.length > 0){
            totalCurrency = quoteChargeItem[0].unitPriceInfo.unitPrice.currency;
            const newItemList = quoteChargeItem.filter(item => {
                if (item.chargeRateItem.chargeRateCategory.code === 'FreightRate'){
                    
                    if (item.quoteFreightFee.isCheck) {
                        if (firstFreight) {
                            levelWeight = Number.parseInt(item.quoteFreightFee.code.replace('+', ''), 0);
                            firstFreight = false;
                            return item;
                        }else {
                            item.quoteFreightFee.isCheck = false;
                        }
                    }else {
                        item.quoteFreightFee.isCheck = false;
                    }
                }else if (item.chargeRateItem.chargeRateCategory.code !== 'FreightRate'){
                    return item;
                }
            });
    
            const grossWeight = entity.queryCondition.weight.value;
            let volumeWeight: number;
            if (entity.queryCondition.volume.unit === 'M'){
                volumeWeight = entity.queryCondition.volume.value * 167;
            }else {
                volumeWeight = entity.queryCondition.volume.value / 6000;
            }
            let chargeWeight: number;
            let maxLevel: number;
            let costWight: number;
            chargeWeight = (grossWeight > volumeWeight) ? grossWeight : volumeWeight;
            maxLevel = (grossWeight > levelWeight) ? grossWeight : levelWeight;
            if (chargeWeight >= maxLevel){
                costWight = maxLevel + ((chargeWeight - maxLevel) * (1 - entity.bubbleRate));
            }else {
                costWight = maxLevel;
            }
            entity.chargeWeight = chargeWeight;
            entity.costWeight = costWight;
            entity.levelWeight = levelWeight;
    
            const quoteSpecialFees: QuoteSpecialFee[] = entity.quoteSpecialFees;
            for (const c of newItemList){
                if (quoteSpecialFees && quoteSpecialFees.length > 0){
                    for (const q of quoteSpecialFees){
                        if (q.feeItems.includes(c.chargeRateItem.code)){
                            q.hasExist = true;
                            c.hasDiscount = true;
                        }
                    }
                }
            }
            total += this.getChargeItemTotal(newItemList, chargeWeight, maxLevel, costWight);
            total += this.getSpecialItemTotal(quoteSpecialFees, chargeWeight, maxLevel, costWight);
        }
        entity.totalCurrency = totalCurrency;
        entity.total = Number.parseFloat(total.toFixed(2));
    }
    
    
    private getChargeItemTotal(quoteChargeItem: QuoteChargeItem[], chargeWeight: number, maxLevel: number, costWight: number): number{
        let itemTotal = 0;
        if (quoteChargeItem && quoteChargeItem.length > 0){
            for (const c of quoteChargeItem){
                if (c.estimateAvailable){
                    let thisCostWeight = 0;
                    let thisItemTotal = 0;
                    if (c.chargeUnit.code === 'BillingWeight'){
                        if (c.unitPriceInfo.weightType.code === 'Grossweight'){
                            thisCostWeight = maxLevel;
                        }else if (c.unitPriceInfo.weightType.code === 'Chargingweight'){
                            if (chargeWeight >= maxLevel){
                                thisCostWeight = costWight;
                            }else {
                                thisCostWeight = maxLevel;
                            }
                        }
                    }else if (c.chargeUnit.code === 'Order'){
                        thisCostWeight = 1;
                    }else if (c.chargeUnit.code === 'Times'){
                        thisCostWeight = 1;
                    }
                    thisItemTotal = thisCostWeight * c.unitPriceInfo.unitPrice.amount;
                    if (c.hasDiscount == null || !c.hasDiscount){
                        itemTotal +=  thisItemTotal;
                    }
                    c.costWeight = thisCostWeight;
                    c.itemTotal = thisItemTotal;
                }
            }
        }
        return itemTotal;
    }
    
    private getSpecialItemTotal(quoteSpecialFees: QuoteSpecialFee[], chargeWeight: number, maxLevel: number, costWight: number): number{
        let itemTotal = 0;
        if (quoteSpecialFees && quoteSpecialFees.length > 0) {
            for (const q of quoteSpecialFees) {
                if (q.hasExist) {
                    let thisCostWeight = 0;
                    let thisItemTotal = 0;
                    if (q.chargeUnit.code === 'BillingWeight') {
                        if (q.weightType.code === 'Grossweight') {
                            thisCostWeight = maxLevel;
                        } else if (q.weightType.code === 'Chargingweight') {
                            if (chargeWeight >= maxLevel) {
                                thisCostWeight = costWight;
                            } else {
                                thisCostWeight = maxLevel;
                            }
                        }
                    } else if (q.chargeUnit.code === 'Order') {
                        thisCostWeight = 1;
                    } else if (q.chargeUnit.code === 'Times') {
                        thisCostWeight = 1;
                    }
                    thisItemTotal = thisCostWeight * q.unitPrice.amount;
                    itemTotal +=  thisItemTotal;
                    q.costWeight = thisCostWeight;
                    q.itemTotal = thisItemTotal;
                }
            }
        }
        return itemTotal;
    }
    
    /*
        打开询价弹窗,将quoteScheme的FieldspecModel传到询价弹窗中
     */
    onGenerateScheme(): void {
        let fSpec: FieldspecModel = null;
        this.fieldSpecs.filter(filed => {
            if (filed.name === 'queryCondition'){
                fSpec = filed;
                return;
            }
        })
        this.dialogRef = this._matDialog.open(QuoteDialogComponent, {
            maxWidth: '85vw',
            data: {
                fSpec: fSpec,
                allFSpec: this.fieldSpecs
            }
        });
        
        this.dialogRef.afterClosed().subscribe(() => {
            this.onPageChange(this.currentPage, this.pageSize);
        });
    }
    
    // 下单弹窗,选择下单的客户,需要先为客户建档
    onGenerateBooking(entity: BaseModel): void{
        let fSpec: FieldspecModel = null;
        this.fieldSpecs.filter(filed => {
            if (filed.name === 'customerCenter'){
                fSpec = filed;
                return;
            }
        })
        this.dialogRef = this._matDialog.open(PlaceOrderDialogComponent, {
            width: '600px',
            data: {
                fSpec: fSpec,
                entity: entity
            }
        });
        this.dialogRef.afterClosed()
        .subscribe(response => {
            console.log(response)
            if (!response) {
                return;
            }
            const customerControl: FormControl = response[1];
            const customerCenter: BaseModel = customerControl.value;
            const updateEntity: QuoteSchemeModel = response[2];
            const quoteChargeItem: QuoteChargeItem[] = updateEntity.quoteChargeItem;
            updateEntity.customerCenter = customerCenter;
            let hasSelectFreight = false;
            if (quoteChargeItem && quoteChargeItem.length > 0) {
                quoteChargeItem.filter(item => {
                    if (item.chargeRateItem.chargeRateCategory.code === 'FreightRate') {
                        if (item.quoteFreightFee.isCheck) {
                            hasSelectFreight = true;
                        }
                    }
                });
            }
            if (hasSelectFreight){
                this.createBookingOrder(this.serviceUrl + 'generateBookingOrder', updateEntity).then(() => {
                    this.onPageChange(this.currentPage, this.pageSize);
                });
            }else {
                this._msgService.alertFail('请选择一个运费项等级后再进行下单!');
            }
           
            console.log(updateEntity);
        });
    }
    
    createBookingOrder(baseUrl: string, m: BaseModel): Promise<BaseModel> {
        const url = baseUrl;
        return this.http.postCall(url, m);
    }
    
    // 编辑费用弹窗
    onEditFeeItem(entity: BaseModel): void{
        let fSpec: FieldspecModel = null;
        this.fieldSpecs.filter(filed => {
            if (filed.name === 'quoteChargeItem'){
                fSpec = filed;
                return;
            }
        })
        this.dialogRef = this._matDialog.open(EditFeeItemComponent, {
            width: '1000px',
            data: {
                fSpec: fSpec,
                entity: entity,
                serviceUrl: this.serviceUrl
            }
        });
    
        this.dialogRef.afterClosed()
        .subscribe(response => {
            if (!response) {
                return;
            }
            const chargeItemForm: FormArray = response[1];
            let quoteChargeItem: QuoteChargeItem[] = new Array<QuoteChargeItem>();
            if (chargeItemForm != null){
               quoteChargeItem =  chargeItemForm.getRawValue();
            }
            const updateEntity: QuoteSchemeModel = response[2];
            updateEntity.quoteChargeItem = quoteChargeItem;
            this._modelService.saveEntity(this.serviceUrl, updateEntity).then(() => {
                this.onPageChange(this.currentPage, this.pageSize);
            });
        });
    }
    
    // 在方案管理这个页面对entity的分泡比进行设置比率
    onSetBubbleRate(entity: QuoteSchemeModel): void{
        let fSpecs: FieldspecModel[] = null;
        fSpecs =  this.fieldSpecs.filter(filed => {
            if (filed.name === 'bubbleRate'){
                return filed;
            }
        })
        this.dialogRef = this._matDialog.open(SetBubbleRateComponent, {
            width: '600px',
            data: {
                fSpecs: fSpecs,
                entity: entity,
                serviceUrl: this.serviceUrl
            }
        });
        
        this.dialogRef.afterClosed()
        .subscribe(response => {
            console.log(response)
            if (!response) {
                return;
            }
            const formGroup: FormGroup = response[1];
            const bubbleRate = formGroup.value.bubbleRate / 100;
            const updateEntity: QuoteSchemeModel = response[2];
            updateEntity.bubbleRate = bubbleRate;
            this._modelService.saveEntity(this.serviceUrl, updateEntity).then(() => {
                this.dealWithThisTotal(entity);
                // this.onPageChange(this.currentPage, this.pageSize);
            });
        });
    }
    
    onPaginatorChanged(event: any): void {
        this.onPageChange(event.pageIndex + 1, event.pageSize);
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
    
    deleteSelectedEntities(): void {
        if (this.selectedEntityIds.length > 0) {
            this._deleteEntitiesWithConfirmation();
        }
    }
    
    removeEntity(e: BaseModel): void {
        this._deleteEntityWithConfirmation(e);
    }
    
    private _deleteEntityWithConfirmation(e?: BaseModel): void {
        if (e == null) {
           return;
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
    
    downloadSelectedEntities(): void {
        if (this.selectedEntityIds.length === 0){
            return;
        }
        this._modelService.downloadSelectedEntity(this.serviceUrl, this.selectedEntityIds);
        this.onPageChange(this.currentPage, this.pageSize);
        this.selectedEntityIds = new Array<number>();
    }
    
    
    hasThisType(quoteChargeItems: QuoteChargeItem[], type: string): boolean{
        for (const item of quoteChargeItems) {
            if (item.chargeRateItem && item.chargeRateItem.chargeRateCategory && item.chargeRateItem.chargeRateCategory.code
                && item.chargeRateItem.chargeRateCategory.code === type){
                return true;
            }
        }
        return false;
    }
    
    getThisTypeName(quoteChargeItems: QuoteChargeItem[], type: string): string{
        for (const item of quoteChargeItems) {
            if (item.chargeRateItem && item.chargeRateItem.chargeRateCategory && item.chargeRateItem.chargeRateCategory.code
                && item.chargeRateItem.chargeRateCategory.code === type){
                return item.chargeRateItem.chargeRateCategory.name;
            }
        }
        return '';
    }
    
    getThisTypeTotal(quoteChargeItems: QuoteChargeItem[], type: string): number{
        let typeTotal = 0;
        if (type === 'FreightRate'){
            for (const item of quoteChargeItems) {
                if (item.chargeRateItem && item.chargeRateItem.chargeRateCategory && item.chargeRateItem.chargeRateCategory.code
                    && item.chargeRateItem.chargeRateCategory.code === type){
                    if (item.quoteFreightFee.isCheck){
                        typeTotal += item.itemTotal;
                    }
                }
            }
        }else {
            for (const item of quoteChargeItems) {
                if (item.chargeRateItem && item.chargeRateItem.chargeRateCategory && item.chargeRateItem.chargeRateCategory.code
                    && item.chargeRateItem.chargeRateCategory.code === type){
                    if (!item.hasDiscount){
                        typeTotal += item.itemTotal;
                    }
                }
            }
        }
        return typeTotal;
    }
    
    hasSpecialFee(quoteSpecialFees: QuoteSpecialFee[]): boolean{
        for (const item of quoteSpecialFees) {
            if (item.hasExist){
                return true;
            }
        }
        return false;
    }
    
    
    getSpecialFeeTotal(quoteSpecialFees: QuoteSpecialFee[]): number{
        let typeTotal = 0;
        for (const item of quoteSpecialFees) {
            if (item.hasExist){
                typeTotal += item.itemTotal;
            }
        }
        return typeTotal;
    }
    
    getFormatter(dateString): string{
        if (dateString){
            return this._toolService.formatDateTime((new Date(dateString)), 'yyyy-MM-dd');
        }else {
            return '';
        }
    }
    
    isFreightRate(type: string): boolean{
        if (type === 'FreightRate'){
            return true;
        }
        return false;
    }
}
