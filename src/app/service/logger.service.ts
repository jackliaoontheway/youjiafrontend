import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class LoggerService {

    constructor() {

    }

    log(message?: any, ...optionalParams: any[]): void {
        if (environment.enableLog) {
            console.log(message, optionalParams);
        }
    }
}
