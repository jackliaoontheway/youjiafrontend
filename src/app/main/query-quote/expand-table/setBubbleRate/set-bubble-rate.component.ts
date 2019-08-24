import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FieldspecModel, SelectiveItem} from '../../../../model/fieldspec.model';
import {ModelService} from '../../../../service/model.service';
import {QuoteSchemeModel} from '../../../../model/quotescheme.model';


@Component({
    selector: 'set-bubble-rate',
    templateUrl: './set-bubble-rate.component.html',
    styleUrls: ['./set-bubble-rate.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SetBubbleRateComponent implements OnInit {
    entity: QuoteSchemeModel;
    bubbleForm: FormGroup;
    dialogTitle: string;
    selectiveItems: SelectiveItem[];
    fSpecs: FieldspecModel[];
    
    
    ngOnInit(): void {
    
    }
    
    constructor(
        public matDialogRef: MatDialogRef<SetBubbleRateComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _modelService: ModelService
    ) {
        this.entity = _data.entity;
        this.fSpecs = _data.fSpecs;
        this.dialogTitle = 'SET BUBBLE RATE';
        this.fSpecs.forEach(spec => {
            spec.selectiveItems = this._modelService.generateSeletiveItems(spec);
            if (spec.selectiveItems && spec.selectiveItems.length > 0){
                spec.selectiveItems.forEach(e => {
                    if (e.value === this.entity.isBubble + ''){
                        e.checked = true;
                    }
                });
            }
            spec.inputType = this._modelService.generateInputType(spec);
        })
        // this.fSpec.selectiveItems = this._modelService.generateSeletiveItems(this.fSpec);
     
        this.bubbleForm = this.createForm();
    }
    
    /**
     * Create contact form
     */
    createForm(): FormGroup {
        return this._formBuilder.group({
            // isBubble: [this.entity.isBubble],
            bubbleRate:  new FormControl(this.entity.bubbleRate * 100, Validators.max(100))
        });
    }
    
    // onSingleValueChange(fSpec: FieldspecModel, event: any): void {
    //     const cons: FormControl = <FormControl>this.bubbleForm.controls[fSpec.name];
    //     console.log(event);
    //     if (fSpec.dataType === 'object') {
    //         const elm = new BaseModel();
    //         elm.id = Number.parseInt(event.value, 10);
    //         cons.setValue(elm);
    //     } else {
    //         cons.setValue(event.value);
    //     }
    // }

}
