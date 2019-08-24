import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordComponent } from 'app/main/myaccount/password/password.component';
import { ProfileComponent } from 'app/main/myaccount/profile/profile.component';
import { SettingComponent } from 'app/main/myaccount/setting/setting.component';

const routes = [{
    path: 'myaccount',
    children: [
        { path: 'password', component: PasswordComponent },
        { path: 'profile', component: ProfileComponent },
        { path: 'setting', component: SettingComponent }
    ]
}];

@NgModule({
    declarations: [
        PasswordComponent,
        ProfileComponent,
        SettingComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        TranslateModule,

        FuseSharedModule
    ],
    exports: [
        PasswordComponent,
        ProfileComponent,
        SettingComponent
    ]
})
export class MyAccountModule {
}
