import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FuseNavigationModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarVerticalStyle1Component } from 'app/layout/components/navbar/style/style.component';

@NgModule({
    declarations: [
        NavbarVerticalStyle1Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        FuseSharedModule,
        FuseNavigationModule
    ],
    exports     : [
        NavbarVerticalStyle1Component
    ]
})
export class NavbarStyleModule{
}
