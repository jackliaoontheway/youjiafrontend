import { BaseModel } from './base.model';
import { UserconfigModel } from './userconfig.model';

export class UseraccountModel extends BaseModel {
    loginName: string;
    password: string;
    newPassword: string;
    status: string;
    admin: boolean;
    logoImage: string;
    userSetting: UserconfigModel;
    contact: BaseModel;
    userAccountRoles: BaseModel[];

    static createEntity(entity: UseraccountModel): UseraccountModel {
        if (entity == null) {
            const ua = new UseraccountModel();
            ua.userSetting = new UserconfigModel();
            ua.contact = new BaseModel();
            return ua;
        } else {
            if (entity.contact == null) {
                entity.contact = new BaseModel();
            }
            if (entity.userSetting == null) {
                entity.userSetting = new UserconfigModel();
            }
            return entity;
        }
    }
}
