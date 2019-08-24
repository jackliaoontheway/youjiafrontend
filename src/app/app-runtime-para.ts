import { UseraccountModel } from './model/useraccount.model';

export const appRuntimePara = {
    currentLoginUser: new UseraccountModel(),
    supportedLanguages: new Array<Object>(), // will be an array of [key: languageId, label:language label]
};
