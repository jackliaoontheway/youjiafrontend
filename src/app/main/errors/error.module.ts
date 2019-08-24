import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';

import { Error404Component } from 'app/main/errors/error-404.component';
import { Error500Component } from 'app/main/errors/error-500.component';

const routes = [
    {
        path     : 'errors/error-404',
        component: Error404Component
    },
    {
        path     : 'errors/error-500',
        component: Error500Component
    }
];

@NgModule({
    declarations: [
        Error404Component,
        Error500Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ],
    exports: [
        Error404Component,
        Error500Component
    ]
})
export class ErrorModule {
}
