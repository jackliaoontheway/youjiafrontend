import { BaseModel } from './base.model';
import {QuoteChargeItem} from './quotechargeitem.model';
import {QueryCondition} from './querycondition.model';
import {QuoteSpecialFee} from './quotespecialfee.model';

export class QuoteSchemeModel extends BaseModel {
    quoteChargeItem: QuoteChargeItem[];
    quoteSpecialFees: QuoteSpecialFee[];
    queryCondition: QueryCondition;
    customerCenter: BaseModel;
    schemeNum: string;
    aviationCompany: AviationCompany;
    airline: Airline;
    airportWarehouse: AirportWarehouse;
    flightCode: string;
    prescription: string;
    totalCurrency: string;
    total: number;
    quoteWeightComponent: QuoteWeightComponent;
    isBubble: boolean;
    bubbleRate: number;
    expiredDate: string;
    chargeWeight: number;
    costWeight: number;
    levelWeight: number;
}

class AviationCompany extends BaseModel{
    code: string;
    name: string;
}


class Airline extends BaseModel{
    code: string;
    name: string;
}

class AirportWarehouse extends BaseModel{
    code: string;
    name: string;
}

class QuoteWeightComponent extends BaseModel{
    grossWeight: Weight;
    volumeWeight: Weight;
    actualWeight: Weight;
    chargeWeight: Weight;
    paymentWeight: Weight;
}


class Weight extends BaseModel{
    unit: string;
    value: number;
}
