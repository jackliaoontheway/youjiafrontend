import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import { APPCONSTANT } from 'app/app-constants';
import { AuthService } from 'app/service/auth.service';

@Component({
    selector   : 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls  : ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    constructor(private _router: Router,
        private _cookieService: CookieService,
        private authService: AuthService){
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }
    
}
