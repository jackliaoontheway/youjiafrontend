import {FieldspecModel} from 'app/model/fieldspec.model';

export class RowFieldSpec {
    left: FieldspecModel;
    right: FieldspecModel;
}

export class ViewFieldSpecModel {
    parentFieldSpec: FieldspecModel;
    normalFields: RowFieldSpec[];
    // oneToOneReadonlyFields: FieldspecModel[];
    oneToOneNormalFields: ViewFieldSpecModel[];
    // oneToManyReadyOnlyFields: FieldspecModel[];
    oneToManyNormalFields: ViewFieldSpecModel[];
    
    constructor() {
        this.parentFieldSpec = null;
        this.normalFields = new Array<RowFieldSpec>();
        // this.oneToOneReadonlyFields = new Array<FieldspecModel>();
        this.oneToOneNormalFields = new Array<ViewFieldSpecModel>();
        // this.oneToManyReadyOnlyFields = new Array<FieldspecModel>();
        this.oneToManyNormalFields = new Array<ViewFieldSpecModel>();
    }
    
    addNormalField(fSpec: FieldspecModel): void {
        if (fSpec.name === 'id' || fSpec.name === 'workflowStep') {
            return;
        }
        if (fSpec == null) {
            return;
        }
        let hasEmptyRight = false;
        this.normalFields.forEach(normalField => {
            if (normalField.right == null) {
                normalField.right = fSpec;
                hasEmptyRight = true;
            }
        });
        if (hasEmptyRight) {
            return;
        }
        const newField = {
            left: fSpec,
            right: null
        };
        this.normalFields.push(newField);
    }
    
    addSubNormalField(viewFields: ViewFieldSpecModel[], fSpec: FieldspecModel): void {
        const subViewFields = new ViewFieldSpecModel();
        subViewFields.parentFieldSpec = fSpec;
        fSpec.componentMetaDatas.forEach(subfSpec => {
            if (!subfSpec.detailHide){
                subViewFields.addNormalField(subfSpec);
            }
        });
        viewFields.push(subViewFields);
    }
}
