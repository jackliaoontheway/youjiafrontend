import { BaseModel } from './base.model';

export class QuoteSpecialFee extends BaseModel {
    name: string;
    feeItems: string;
    unitPrice: UnitPrice;
    chargeUnit: ChargeUnit;
    weightType: WeightType;
    costWeight: number;
    itemTotal: number;
    hasExist: boolean;
}

class UnitPrice extends BaseModel{
    currency: string;
    amount: number;
}

class ChargeUnit extends BaseModel {
    code: string;
    name: string;
}

class WeightType  extends BaseModel {
    code: string;
    name: string;
}
