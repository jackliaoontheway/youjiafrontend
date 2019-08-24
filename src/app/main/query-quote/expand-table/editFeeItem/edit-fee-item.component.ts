import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelService} from 'app/service/model.service';
import {BaseModel} from 'app/model/base.model';
import {FieldspecModel} from 'app/model/fieldspec.model';
import {ModelspecModel} from 'app/model/modelspec.model';

@Component({
    selector: 'model-pop',
    templateUrl: './edit-fee-item.component.html',
    styleUrls: ['./edit-fee-item.component.scss'],
    styles: ['.mat-dialog-container {padding: 12px;}'],
    encapsulation: ViewEncapsulation.None
})
export class EditFeeItemComponent {
    
    dialogTitle: string;
    // modelForm: FormGroup;
    entity: BaseModel;
    serviceUrl: string;
    modelSpec: ModelspecModel;
    validForm: boolean;
    fSpec: FieldspecModel;
    chargeItemForm: FormArray;
    
    constructor(public matDialogRef: MatDialogRef<EditFeeItemComponent>,
                private _formBuilder: FormBuilder,
                private modelService: ModelService,
                @Inject(MAT_DIALOG_DATA) private _data: any) {
        this.fSpec = _data.fSpec;
        this.fSpec.selectiveItems = this.modelService.generateSeletiveItems(this.fSpec);
     
        this.dialogTitle = '编辑费用项';
        this.entity = _data.entity;
        this.fSpec.componentMetaDatas.forEach(fSpec => {
            fSpec.inputType = this.modelService.generateInputType(fSpec);
            fSpec.i18nResourcesForField = this.modelService.getFieldResources(this.entity, fSpec, this.fSpec.componentMetaDatas);
        });
        this.chargeItemForm = this.modelService.generateFieldForm(this.entity, this.fSpec);
    }
    
    
    addNewItem(fSpec: FieldspecModel): void {
        if (this.chargeItemForm == null){
            this.chargeItemForm = <FormArray>this._formBuilder.array([]);
        }
        this.chargeItemForm.push(this.modelService.createModelForm(new BaseModel(), fSpec.componentMetaDatas));
    }
    
    onRemoveButtonClick(controls: FormArray, i: number): void {
        controls.removeAt(i);
        this.validForm = this.chargeItemForm.valid;
    }
    
    onFormValidChanged(valid: boolean): void {
        this.validForm = valid;
    }
    
    getTitleValue(e: BaseModel, fSpec: FieldspecModel): string {
        const titleValue =  this.modelService.convertObjectIntoString(e, fSpec.labelField, fSpec.componentMetaDatas);
        if (titleValue && titleValue != null){
            return titleValue;
        }else {
            return fSpec.label;
        }
    }
}
