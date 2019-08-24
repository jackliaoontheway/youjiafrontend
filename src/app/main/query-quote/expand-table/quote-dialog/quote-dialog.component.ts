import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {QueryQuoteModel} from '../../../../model/queryquote.model';
import {BaseModel} from '../../../../model/base.model';
import {ModelService} from '../../../../service/model.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {QuoteSchemeModel} from '../../../../model/quotescheme.model';
import {QuoteChargeItem} from '../../../../model/quotechargeitem.model';
import {FieldspecModel, SelectiveItem} from '../../../../model/fieldspec.model';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {QuoteSpecialFee} from '../../../../model/quotespecialfee.model';


@Component({
    selector: 'quote-dialog',
    templateUrl: './quote-dialog.component.html',
    styleUrls: ['./quote-dialog.component.scss'],
    styles: ['.mat-form-field-infix{width: 155px}', '.mat-dialog-container{padding: 12px;}'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class QuoteDialogComponent implements OnInit {
    entity: QueryQuoteModel;
    quoteForm: FormGroup =  null;
    schemeEntities: QuoteSchemeModel[];
    showLoading: Boolean = false;
    dialogTitle: string;
    
    // 这是quoteconditon的FieldspecModel
    fieldSpec: FieldspecModel;
    // 这是quoteconditon的MetaDatas
    fSpecMetaDatas: FieldspecModel[];
    // 这是所有quoteScheme的FieldspecModel
    allFSpec: FieldspecModel[];
    
    filteredOptions = new Array<Observable<any[]>>();
    
    myControl = new Array<FormControl>();
    
    constructor(
        public matDialogRef: MatDialogRef<QuoteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _modelService: ModelService,
    ) {
        this.fieldSpec = _data.fSpec;
        this.allFSpec = _data.allFSpec
        this.entity = new QueryQuoteModel();
        this.quoteForm = this.createQuoteForm();
        this.dialogTitle = '询价';
        this.fSpecMetaDatas = this.fieldSpec.componentMetaDatas;
        this.fSpecMetaDatas =  this.fSpecMetaDatas.filter(field => {
            if (field.name !== 'id'){
                return field;
            }
        })
        this.fSpecMetaDatas.forEach(fs => {
            // fs.selectiveItems = this._modelService.generateSeletiveItems(fs);
            fs.inputType = this.generateInputType(fs);
            fs.i18nResourcesForField = this._modelService.getFieldResources(this.entity, fs, fs.componentMetaDatas);
            if (fs.enumFlag && fs.selectiveItems.length > 2) {
                this.myControl[fs.name] = new FormControl();
                for (const item of fs.selectiveItems) {
                    if (item.checked) {
                        this.myControl[fs.name].setValue(item.label);
                    }
                }
                this.filteredOptions[fs.name] = this.myControl[fs.name].valueChanges
                .pipe(startWith<string>(''),
                    map(selectiveItem => selectiveItem ?
                        this._filter(fs, selectiveItem) : fs.selectiveItems.slice())
                );
            }
        });
    }
    
    ngOnInit(): void {
    }
    
    /**
     * Create contact form
     */
    createQuoteForm(): FormGroup {
        return this._formBuilder.group({
            departAirPort: new FormControl(this.entity.departAirPort, Validators.required),
            toCity: new FormControl(this.entity.toCity, Validators.required),
            quantity: [this.entity.quantity],
            weight: this._formBuilder.group({
                unit: [this.entity.weight.unit],
                value: [this.entity.weight.value]
            }),
            volume: this._formBuilder.group({
                unit: [this.entity.volume.unit],
                value: [this.entity.volume.value]
            }),
            goodsName: [this.entity.goodsName],
            pickupLocation: [this.entity.pickupLocation],
            customerCenter: [this.entity.customerCenter]
        });
    }
    
    onQuery(): void{
        const formEntity: BaseModel = this.quoteForm.getRawValue();
        console.log(formEntity);
        this.showLoading = true;
        this._modelService.saveEntityByCriteria('/quoteSchemes/', 'generateScheme', formEntity).then(
            data => {
                if (data) {
                    this.schemeEntities = data;
                    this.showLoading = false;
                    this.dealWithTotal(this.schemeEntities);
                }
            }
        );
    }
    
    // 对即时询价得出的方案进行预处理,计算出每条数据的总价,进行放到quote-dialog-table中显示
    private dealWithTotal(entities: QuoteSchemeModel[]): void{
        console.log(entities);
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
    
    
    private _filter(fSpec: FieldspecModel, label: any): SelectiveItem[] {
        const filterValue = label.toLowerCase();
        
        return fSpec.selectiveItems.filter(selectiveItem =>
            selectiveItem.label.toLowerCase().includes(filterValue));
    }
    
    onSingleValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.quoteForm.controls[fSpec.name];
        console.log(event);
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.value, 10);
            cons.setValue(elm);
        } else {
            cons.setValue(event.value);
        }
    }
    
    onEmbeddedbValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormGroup = <FormGroup>this.quoteForm.controls[fSpec.name];
        cons.controls['unit'].setValue(event.value);
    }
    
    onEmptyValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormGroup = <FormGroup>this.quoteForm.controls[fSpec.name];
        if (event.value == null || event.value){
            cons.setValue(null);
        }
    }
    
    getSingleSelectionInitialValue(fSpec: FieldspecModel): string {
        if (fSpec == null || fSpec.selectiveItems == null || fSpec.selectiveItems.length === 0) {
            return '';
        }
        for (const item of fSpec.selectiveItems) {
            if (item.checked) {
                return item.value;
            }
        }
        return '';
    }
    
    onAutoCompleteSelected(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.quoteForm.controls[fSpec.name];
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.option.viewValue.split(',')[1], 10);
            cons.setValue(elm);
        } else {
            cons.setValue(event.option.viewValue.split(',')[1]);
        }
    }
    
    onBackAction(): void {
        this.matDialogRef.close();
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
                inputType = 'checkbox';
            } else {
                // this is a enumeration data with single choice
                if (fSpec.selectiveItems != null) {
                    if (fSpec.selectiveItems.length > 2){
                        inputType = 'autocomplete';
                    }else {
                        inputType = 'singleSelect';
                    }
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
    
}
