import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FieldspecModel} from 'app/model/fieldspec.model';
import {SelectiveItem} from 'app/model/fieldspec.model';
import {ModelService} from 'app/service/model.service';
import {BaseModel} from 'app/model/base.model';
import {appRuntimePara} from 'app/app-runtime-para';

@Component({
    selector: 'search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnChanges {
    
    @Input()
    fieldSpecs: FieldspecModel[];
    
    @Input()
    entity: BaseModel;
    
    @Input()
    modelForm: FormGroup;
    
    @Output()
    formValidChanged = new EventEmitter<any>();
    
    @Output()
    formChanged = new EventEmitter<any>();
    
    supportLanguages: any[];
    
    filteredOptions = new Array<Observable<any[]>>();
    
    myControl = new Array<FormControl>();
    
    fileNameControl = new FormControl();
    
    // fileUploader: FileUploader = new FileUploader({ removeAfterUpload: true });
    
    constructor(private _modelService: ModelService) {
    }
    
    ngOnChanges(): void {
        // console.log(this.fieldSpecs);
        if (appRuntimePara.supportedLanguages.length > 0) {
            this.supportLanguages = appRuntimePara.supportedLanguages;
        }
        if (this.fieldSpecs != null && this.fieldSpecs.length > 0) {
            this.fieldSpecs.forEach(fSpec => {
                fSpec.inputType = this.generateInputType(fSpec);
            });
            for (const fSpec of this.fieldSpecs) {
                if (fSpec.enumFlag && fSpec.selectiveItems.length > 10) {
                    this.myControl[fSpec.name] = new FormControl();
                    for (const item of fSpec.selectiveItems) {
                        if (item.checked) {
                            this.myControl[fSpec.name].setValue(item.label);
                        }
                    }
                    this.filteredOptions[fSpec.name] = this.myControl[fSpec.name].valueChanges
                    .pipe(startWith<string>(''),
                        map(selectiveItem => selectiveItem ? this._filter(fSpec, selectiveItem) : fSpec.selectiveItems.slice())
                    );
                } else if (fSpec.dataType === 'file') {
                    this.fileNameControl.setValue(this.modelForm.controls[fSpec.name].value.fileName);
                }
                
            }
        }
    }
    
    onFormChanged(valid: boolean): void {
        this.formChanged.emit(this.modelForm);
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
                inputType = 'singleSelect';
            }
        } else if (fSpec.i18nField && !fSpec.enumFlag) {
            inputType = 'textfori18n';
        } else if (fSpec.dataType === 'boolean') {
            inputType = 'singleSelect';
        } else if (fSpec.dataType === 'date') {
            inputType = 'date';
        } else if (fSpec.dataType === 'email') {
            inputType = 'email';
        } else if (fSpec.dataType === 'file') {
            inputType = 'file';
        } else if (fSpec.dataType === 'object') {
            inputType = 'embedded';
        } else if (fSpec.dataType === 'array') {
            inputType = 'array';
        } else {
            inputType = 'text';
        }
        return inputType;
    }
    
    
    private _filter(fSpec: FieldspecModel, label: any): SelectiveItem[] {
        const filterValue = label.toLowerCase();
        
        return fSpec.selectiveItems.filter(selectiveItem => selectiveItem.label.toLowerCase().indexOf(filterValue) === 0);
    }
    
    showThisFieldForEditing(fSpec: FieldspecModel): boolean {
        if (fSpec.inputType === 'file') {
            return false;
        }
        if (!fSpec.embedded && fSpec.componentMetaDatas != null && fSpec.componentMetaDatas.length > 0) {
            return true;
        }
        return true;
    }
    
    onValueChange(): void {
        this.formChanged.emit(this.modelForm);
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
    
    onSingleValueChange(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];
        console.log(event);
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.value, 10);
            cons.setValue(elm);
        } else {
            cons.setValue(event.value);
        }
    }
    
    onSelectionChanged(fSpec: FieldspecModel, value: string): void {
        const cons: FormArray = <FormArray>this.modelForm.controls[fSpec.name];
        let hasValue = false;
        for (let ii = 0; ii < cons.length; ii++) {
            if (cons.controls[ii].value['id'] === Number.parseInt(value, 10)) {
                hasValue = true;
                cons.removeAt(ii);
                break;
            }
        }
        if (!hasValue) {
            const elm = new BaseModel();
            elm.id = Number.parseInt(value, 10);
            cons.push(new FormControl(elm));
        }
    }
    
    
    onAutoCompleteSelected(fSpec: FieldspecModel, event: any): void {
        const cons: FormControl = <FormControl>this.modelForm.controls[fSpec.name];
        
        if (fSpec.dataType === 'object') {
            const elm = new BaseModel();
            elm.id = Number.parseInt(event.option.viewValue.split(',')[1], 10);
            cons.setValue(elm);
        } else {
            cons.setValue(event.option.viewValue.split(',')[1]);
        }
    }
    
}
