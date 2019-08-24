import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseCountdownModule } from '@fuse/components';

import { ComingSoonComponent } from 'app/main/coming-soon/coming-soon.component';

const routes = [
    {
        path     : 'coming-soon',
        component: ComingSoonComponent
    }
];

@NgModule({
    declarations: [
        ComingSoonComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        
        TranslateModule,

        FuseSharedModule,
        FuseCountdownModule
    ],
    exports: [
        ComingSoonComponent
    ]
})
export class ComingSoonModule
{
}
