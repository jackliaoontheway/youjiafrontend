import { I18nresourceModel } from './i18nresource.model';
import { FileInfo } from './fileinfo.model';

// 保存业务模型中的文件型数据， fieldName为使用','分开的级联名称
export class FileInfoDesc {
    fieldName: string;
    file: FileInfo;
}

export class BaseModel {
    id: number;
    tempId: number; // will generated automatically locally to distinguish the new entity.
    curPageSize: number;
    pageIndex: number;
    i18nResources: I18nresourceModel[];
    fieldI18nResources: [string, I18nresourceModel[]][];
    sortField: string;
    sortDesc: boolean; // DESC(from big to small) or ASC(from small to big)
    fileInfo: FileInfoDesc; // 目前业务模型中支持有一个带附件的属性字段
    // 保存模糊搜索的输入值，
    smartSearchText: string;
    entityName: string;
}
