import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';

import { FooterComponent } from 'app/layout/components/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
    declarations: [
        FooterComponent
    ],
    imports     : [
        RouterModule,

        MatButtonModule,
        MatIconModule,
        MatToolbarModule,

        FuseSharedModule,
		TranslateModule
    ],
    exports     : [
        FooterComponent
    ]
})
export class FooterModule
{
}
