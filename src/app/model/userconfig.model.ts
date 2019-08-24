import { BaseModel } from './base.model';

export class UserconfigModel extends BaseModel {
    viewLang: string;
    workLang: string;
    pageSize: number;
    hiddenFields: string;
    tableHiddenFields: string;
    firstPageUrl: string;
}
