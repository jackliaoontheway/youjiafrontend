import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {fuseAnimations} from '@fuse/animations';
import {ModelService} from 'app/service/model.service';
import {BaseModel} from 'app/model/base.model';
import {FieldspecModel} from 'app/model/fieldspec.model';

@Component({
    selector: 'table-dialog',
    templateUrl: './table-dialog.component.html',
    styleUrls: ['./table-dialog.component.scss'],
    animations: fuseAnimations
})
export class TableDialogComponent {
    modelTitle: string;
    entities: BaseModel[];
    fieldSpecs: FieldspecModel[];
    serviceUrl: string;
    columnsToDisplay: string[] = new Array<string>(); // new Array<string>();
    constructor(public matDialogRef: MatDialogRef<TableDialogComponent>,
                private modelService: ModelService, @Inject(MAT_DIALOG_DATA) private _data: any) {
        this.modelTitle = _data.modelTitle;
        this.fieldSpecs = _data.fieldSpecs;
        this.serviceUrl = _data.serviceUrl;
        this.entities = _data.entities;
        this.fieldSpecs.forEach(fSpec => {
            if (!fSpec.hide) {
                this.columnsToDisplay.push(fSpec.name);
            }
        });
    }
    
    getFieldValue(e: BaseModel, fSpec: FieldspecModel, fieldName: string): string {
        return this.modelService.getFieldValue(e, fSpec, fieldName);
    }
}
