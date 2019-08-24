import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule, FuseConfirmDialogModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { DashboardModule } from 'app/main/dashboard/dashboard.module';
import { LoginModule } from 'app/main/login/login.module';
import { RegisterModule } from 'app/main/register/register.module';
import { ForgotPasswordModule } from 'app/main/forgot-password/forgot-password.module';
import { ResetPasswordModule } from 'app/main/reset-password/reset-password.module';
import { ComingSoonModule } from 'app/main/coming-soon/coming-soon.module';

import { MessageModule } from 'app/message/message.module';
import { ErrorModule } from 'app/main/errors/error.module';

import { LoggerService } from 'app/service/logger.service';
import { ToolService } from 'app/service/tool.service';
import { RestfulService } from 'app/service/restful.service';
import { AuthService } from 'app/service/auth.service';
import { MyAccountModule } from 'app/main/myaccount/myaccount.module';
import { ModelViewComponent } from 'app/model-view/model-view.component';
import { ModelComponentModule } from 'app/model-view/model.component.module';
import {QuoteViewModule} from './main/query-quote/quote-view.module';
import { HwcargoModule } from './main/hwcargo/hwcargo.module';

export function httpLoaderFactory(httpClient: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

const appRoutes: Routes = [
    { path: 'modelview/:modelname', component: ModelViewComponent, data: { showList: true } },
    { path: '**', redirectTo: 'errors/error-404' }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (httpLoaderFactory),
                deps: [HttpClient]
            }
        }),
        RouterModule.forRoot(appRoutes),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatButtonModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        FuseConfirmDialogModule,

        // App modules
        LayoutModule,
        LoginModule,
        ComingSoonModule,
        RegisterModule,
        ForgotPasswordModule,
        ResetPasswordModule,
        DashboardModule,
        MyAccountModule,

        ErrorModule,
        MessageModule,
        ModelComponentModule,
        QuoteViewModule,
        HwcargoModule
    ],
    providers: [
        LoggerService,
        RestfulService,
        // CookieService,
        ToolService,
        AuthService,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
