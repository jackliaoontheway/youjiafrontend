import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { ContentModule } from 'app/layout/components/content/content.module';
import { FooterModule } from 'app/layout/components/footer/footer.module';
import { NavbarModule } from 'app/layout/components/navbar/navbar.module';
import { ToolbarModule } from 'app/layout/components/toolbar/toolbar.module';
import { LayoutComponent } from 'app/layout/layout.component';

@NgModule({
    declarations: [
        LayoutComponent,
    ],
    imports     : [
        RouterModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        ToolbarModule
    ],
    exports     : [
        LayoutComponent,
    ]
})
export class LayoutModule{
}
