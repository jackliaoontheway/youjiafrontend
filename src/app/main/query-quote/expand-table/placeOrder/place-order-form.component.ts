import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {FieldspecModel, SelectiveItem} from '../../../../model/fieldspec.model';
import {ModelService} from '../../../../service/model.service';
import {BaseModel} from '../../../../model/base.model';


@Component({
    selector: 'place-order-form',
    templateUrl: './place-order-form.component.html',
    styleUrls: ['./place-order-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PlaceOrderDialogComponent implements OnInit {
    entity: BaseModel;
    quoteForm: FormGroup;
    dialogTitle: string;
    filteredOptions = new Array<Observable<any[]>>();
    selectControls = new Array<FormControl>();
    selectiveItems: SelectiveItem[];
    fSpec: FieldspecModel;
    customerControl: FormControl = new FormControl();
    disableSelect: boolean;
    
    ngOnInit(): void {
    
    }
    
    constructor(
        public matDialogRef: MatDialogRef<PlaceOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _modelService: ModelService
    ) {
       
        this.fSpec = _data.fSpec;
        this.selectiveItems = this._modelService.generateSeletiveItems(this.fSpec);
        this.dialogTitle = '生成订单';
        this.entity = _data.entity;
   
        // this.quoteForm = this.createQuoteForm();
        this.disableSelect = false;
        this.selectControls[this.fSpec.name] = new FormControl();
        for (const item of this.selectiveItems) {
            if (this.getCheckInitialValue(this.fSpec, item)) {
                this.selectControls[this.fSpec.name].setValue(item.label);
                if (this.fSpec.dataType === 'object') {
                    const elm = new BaseModel();
                    elm.id = Number.parseInt(item.value, 10);
                    this.customerControl.setValue(elm);
                } else {
                    this.customerControl.setValue(item.value);
                }
                this.disableSelect = true;
            }
        }
        this.filteredOptions[this.fSpec.name] = this.selectControls[this.fSpec.name].valueChanges
        .pipe(startWith<string>(''),
            map(selectiveItem => selectiveItem ? this._filter(selectiveItem) : this.selectiveItems.slice())
        );
    }
    
    private _filter(label: any): SelectiveItem[] {
        const filterValue = label.toLowerCase();
        
        return this.selectiveItems.filter(selectiveItem =>   selectiveItem.label.toLowerCase().includes(filterValue));
    }
    
    /**
     * Create contact form
     */
    // createQuoteForm(): FormGroup {
    //     return this._formBuilder.group({
    //         origin: [this.entity.origin],
    //         destination: [this.entity.destination],
    //         quantity: [this.entity.quantity],
    //         weight: this._formBuilder.group({
    //             unit: '',
    //             value: ''
    //         }),
    //         volume: [this.entity.volume],
    //         goodsName: [this.entity.goodsName],
    //     });
    // }
    
    onAutoCompleteSelected(fSpec: FieldspecModel, event: any): void {
        // const cons: FormControl = new FormControl();
        
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.option.viewValue.split(',')[1], 10);
            this.customerControl.setValue(elm);
        } else {
            this.customerControl.setValue(event.option.viewValue.split(',')[1]);
        }
        console.log(this.customerControl);
    }
    
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
}
