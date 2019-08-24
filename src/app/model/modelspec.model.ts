import { BaseModel } from './base.model';
import { FieldspecModel } from './fieldspec.model';
import { FunctionalityModel } from './functionality.model';

export class ModelspecModel extends BaseModel {
    iconName: string;
    searchField: string;
    indexField: string;
    indexSortDesc: boolean;
    className: string;
    label: string;
    updatable: boolean;
    deletable: boolean;
    cloneable: boolean;
    batchDeletable: boolean;
    addible: boolean;
    downloadable: boolean;
    uploadable: boolean;
    level: number;
    showDetailFieldName: string;
    fieldSpecs: FieldspecModel[];
    modelFunctionalities: FunctionalityModel[];
    objectFunctionalities: FunctionalityModel[];
    tabListValues: string[];
    tabField: string;
}
