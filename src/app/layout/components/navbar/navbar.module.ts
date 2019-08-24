import { NgModule } from '@angular/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarComponent } from 'app/layout/components/navbar/navbar.component';
import { NavbarStyleModule } from 'app/layout/components/navbar/style/style.module';

@NgModule({
    declarations: [
        NavbarComponent
    ],
    imports     : [
        FuseSharedModule,
        NavbarStyleModule,
    ],
    exports     : [
        NavbarComponent
    ]
})
export class NavbarModule{
}
