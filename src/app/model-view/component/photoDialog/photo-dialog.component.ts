import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {fuseAnimations} from '@fuse/animations';
import {ModelService} from 'app/service/model.service';


@Component({
    selector: 'table-dialog',
    templateUrl: './photo-dialog.component.html',
    styleUrls: ['./photo-dialog.component.scss'],
    animations: fuseAnimations
})
export class PhotoDialogComponent {
    imgTitle: string;
    imgUrl: string;
    
    constructor(public matDialogRef: MatDialogRef<PhotoDialogComponent>,
                private modelService: ModelService, @Inject(MAT_DIALOG_DATA) private _data: any) {
        this.imgTitle = _data.imgTitle;
        this.imgUrl = _data.imgUrl;
    }
    
}
