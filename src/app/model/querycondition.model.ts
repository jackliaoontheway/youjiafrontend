import { BaseModel } from './base.model';

export class QueryCondition extends BaseModel{
    weight: Weight;
    volume: Volume;
    toCity: CityCode;
}

class Weight extends BaseModel{
    unit: string;
    value: number;
}

class Volume extends BaseModel{
    unit: string;
    value: number;
}

class CityCode extends BaseModel{
    code: string;
    name: string;
}
