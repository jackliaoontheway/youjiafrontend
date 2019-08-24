import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';

import { ResetPasswordComponent } from 'app/main/reset-password/reset-password.component';

const routes = [
    {
        path     : 'reset-password',
        component: ResetPasswordComponent
    }
];

@NgModule({
    declarations: [
        ResetPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        TranslateModule,

        FuseSharedModule
    ],
    exports: [
        ResetPasswordComponent
    ]
})
export class ResetPasswordModule{
}
