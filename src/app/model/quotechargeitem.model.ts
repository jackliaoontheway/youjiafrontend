import { BaseModel } from './base.model';


export class QuoteChargeItem extends BaseModel{
    quoteFreightFee: QuoteFreightFee;
    chargeUnit: ChargeUnit;
    // chargeItemType: ChargeItemType;
    unitPriceInfo: QuotePriceInfo;
    minSalesPriceInfo: QuotePriceInfo;
    // chargeRateCode: string;
    estimateAvailable: boolean;
    costWeight: number;
    itemTotal: number;
    hasDiscount: boolean;
    chargeRateItem: ChargeRateItem;
}

class ChargeItemType extends BaseModel{
    code: string;
    name: string;
}

class UnitPrice extends BaseModel{
    currency: string;
    amount: number;
}

class ChargeUnit extends BaseModel {
    code: string;
    name: string;
}

class QuoteFreightFee  extends BaseModel {
    code: string;
    name: string;
    isCheck: boolean;
}

class WeightType  extends BaseModel {
    code: string;
    name: string;
}

class QuotePriceInfo  extends BaseModel {
    unitPrice: UnitPrice;
    weightType: WeightType;
}

class ChargeRateItem  extends BaseModel {
    code: string;
    name: string;
    chargeRateCategory: ChargeRateCategory;
}


class ChargeRateCategory  extends BaseModel {
    code: string;
    name: string;
}
