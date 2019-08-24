import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelService} from 'app/service/model.service';
import {BaseModel} from 'app/model/base.model';
import {FieldspecModel} from 'app/model/fieldspec.model';
import {ModelspecModel} from 'app/model/modelspec.model';
import {ViewFieldSpecModel} from 'app/model-view/model-view.model';

@Component({
    selector: 'model-pop',
    templateUrl: './model-pop.component.html',
    styleUrls: ['./model-pop.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModelPopComponent {
    
    actionString: string;
    modelForm: FormGroup;
    entity: BaseModel;
    fieldSpecs: FieldspecModel[];
    viewFieldSpecs: ViewFieldSpecModel;
    serviceUrl: string;
    modelSpec: ModelspecModel;
    
    constructor(public matDialogRef: MatDialogRef<ModelPopComponent>,
                private modelService: ModelService, @Inject(MAT_DIALOG_DATA) private _data: any) {
        
        this.actionString = _data.action;
        this.fieldSpecs = _data.fieldSpecs;
        this.viewFieldSpecs = _data.viewFieldSpecs;
        this.serviceUrl = _data.serviceUrl;
        this.modelSpec = _data.modelSpec;
        if (this.actionString === 'edit') {
            this.entity = _data.entity;
        } else if (this.actionString === 'detail') {
            this.entity = _data.entity;
        } else {
            this.entity = new BaseModel();
        }
        
        this.fieldSpecs.forEach(fSpec => {
            fSpec.inputType = this.modelService.generateInputType(fSpec);
            fSpec.i18nResourcesForField = this.modelService.getFieldResources(this.entity, fSpec, this.fieldSpecs);
        });
        this.modelForm = this.modelService.createModelForm(this.entity, this.fieldSpecs);
    }
}
