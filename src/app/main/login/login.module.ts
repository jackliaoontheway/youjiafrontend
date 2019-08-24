import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';

import { LoginComponent } from 'app/main/login/login.component';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

const routes = [
    {
        path     : 'login',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        FuseSharedModule,

        TranslateModule
    ],
    exports: [
        LoginComponent
    ]
})
export class LoginModule{
}
