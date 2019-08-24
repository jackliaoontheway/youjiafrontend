import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {ModelService} from '../../../../../service/model.service';
import {MessageService} from '../../../../../message/message.service';
import {QuoteSchemeModel} from '../../../../../model/quotescheme.model';
import {QuoteChargeItem} from '../../../../../model/quotechargeitem.model';
import {FieldspecModel} from '../../../../../model/fieldspec.model';
import {SetBubbleRateComponent} from '../../setBubbleRate/set-bubble-rate.component';
import {FormGroup} from '@angular/forms';
import {ToolService} from '../../../../../service/tool.service';
import {QuoteSpecialFee} from '../../../../../model/quotespecialfee.model';
import {BaseModel} from '../../../../../model/base.model';


@Component({
    selector: 'quote-dialog-table',
    templateUrl: './quote-dialog-table.component.html',
})
export class QuoteDialogTableComponent  implements OnInit{
    
    @Input()
    entities: QuoteSchemeModel[];
    selectedEntitys: QuoteSchemeModel[] = new Array<QuoteSchemeModel>();
    dialogRef: any;
    @Output()
    backAction = new EventEmitter<any>();
    chargeType: string[];
    @Input()
    fieldSpecs: FieldspecModel[];
    schemeObj: object;
    queryObj: object;
    specialFeeObj: object;
    
    constructor( private _translate: TranslateService,
                 private _cookieService: CookieService,
                 private _modelService: ModelService,
                 private _matDialog: MatDialog,
                 private _msgService: MessageService,
                 private _toolService: ToolService) {
        this.chargeType = ['FreightRate', 'AviationCompanyLocalChargeRate', 'AirportWarehouseLocalChargeRate',
            'AirportLocalChargeRate', 'FreightSubChargeRate', 'InHouseLocalChargeRate', 'PickupChargeRate', 'TransferChargeRate'];
    }
    
    ngOnInit(): void {
        this.schemeObj = new Object();
        for (const item of this.fieldSpecs){
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
    }
    
    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName?: string): string {
        return this._modelService.getFieldValue(e, fSpec, fieldName);
    }
    
    /* ------------ 批处理选择方案相关方法-------------*/
    checkSelection(entity: QuoteSchemeModel): string {
        if (this.selectedEntitys.length > 0) {
            const index = this.selectedEntitys.indexOf(entity);
            if (index !== -1) {
                return 'checked';
            }
        }
        return '';
    }
    
    onSelectAllChanged(checked: boolean): void {
        this.selectedEntitys = new Array<QuoteSchemeModel>();
        if (checked) {
            for (const e of this.entities) {
                this.selectedEntitys.push(e);
            }
        }
    }
    
    isAllSelectionChecked(): string {
        if (this.selectedEntitys && this.entities) {
            if (this.selectedEntitys.length === this.entities.length) {
                return 'checked';
            } else {
                return '';
            }
        } else {
            return '';
        }
    }
    
    onSelectedChange(entity: QuoteSchemeModel): void {
        if (this.selectedEntitys.length > 0) {
            const index = this.selectedEntitys.indexOf(entity);
            if (index !== -1) {
                this.selectedEntitys.splice(index, 1);
                return;
            }
        }
        this.selectedEntitys.push(entity);
        console.log(this.selectedEntitys);
    }
    /* ------------ 批处理选择方案相关方法-------------*/
    
    // 保存选中方案
    onSaveScheme(formEntity: QuoteSchemeModel): void{
        console.log(formEntity);
        if (formEntity.bubbleRate == null){
            formEntity.bubbleRate = 0;
        }
        const date = new Date();
        date.setDate(date.getDate() + 7);
        formEntity.expiredDate = this._toolService.formatDateTime(new Date(date), 'yyyy-MM-dd');
        this._modelService.saveEntity('/quoteSchemes/', formEntity).then(() => {
            this.backAction.emit();
        });
    }
    
    onSaveSelectScheme(): void{
        if (this.selectedEntitys && this.selectedEntitys.length > 0){
            for (const entity of this.selectedEntitys){
                if (entity.bubbleRate == null){
                    entity.bubbleRate = 0;
                }
                const date = new Date();
                date.setDate(date.getDate() + 7);
                entity.expiredDate = this._toolService.formatDateTime(new Date(date), 'yyyy-MM-dd');
            }
            this._modelService.createEntitys('/quoteSchemes/saveSchemeList', this.selectedEntitys).then(() => {
                this.backAction.emit();
            });
        }
 
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
    
    isFreightRate(type: string): boolean{
        if (type === 'FreightRate'){
            return true;
        }
        return false;
    }
    
    /**
     * 询价弹窗更改分泡比
     */
    onSetBubbleRate(entity: QuoteSchemeModel): void{
        let fSpecs: FieldspecModel[] = null;
        fSpecs =  this.fieldSpecs.filter(filed => {
            if (filed.name === 'bubbleRate'){
                return filed;
            }
        })
        console.log(this.fieldSpecs);
        this.dialogRef = this._matDialog.open(SetBubbleRateComponent, {
            width: '600px',
            data: {
                fSpecs: fSpecs,
                entity: entity,
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
            entity.bubbleRate = bubbleRate;
            this.dealWithThisTotal(entity);
        });
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
    
    /*
     这是在勾选询价弹窗运费项时,进行计算总费用,勾选哪个选哪个
     弹窗询价的方案都是没有进行保存的,需要勾选方案后进行保存到方案管理中
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
    
}
