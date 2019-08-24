import { BaseModel } from './base.model';

export class FunctionalityModel extends BaseModel {
    code: string;
    label: string;
    iconName: string;
    positionSn: number;
    pathUrl: string;
    active: string;
    subMenus: FunctionalityModel[];
    mainMenu: boolean;
    // 这是一个批量的操作，针对类操作有效
    // 当一个操作是批量操作的时候， 可以选择多个实例
    batchOperation: boolean;
}
