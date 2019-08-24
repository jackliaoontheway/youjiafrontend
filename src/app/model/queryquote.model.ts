import { BaseModel } from './base.model';

export class QueryQuoteModel extends BaseModel {
    // origin: string;
    // destination: string;
    departAirPort: AirPortInfo;
    toCity: CityCode;
    quantity: number;
    weight: Weight = new Weight();
    volume: Volume = new Volume();
    goodsName: string;
    pickupLocation: PickupLocation;
    customerCenter: CustomerCenter;
}

class Weight extends BaseModel{
    unit: string;
    value: number;
}

class Volume extends BaseModel{
    unit: string;
    value: number;
}
class AirPortInfo extends BaseModel{
    unit: string;
    value: number;
}

class CityCode extends BaseModel{
    unit: string;
    value: number;
}

class PickupLocation extends BaseModel{
    code: string;
    name: number;
}

class CustomerCenter extends BaseModel{
    code: string;
    name: number;
}
