import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { QuoteViewComponent } from './quote-view.component';
import {MatButtonModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatToolbarModule} from '@angular/material';
import {ModelComponentModule} from '../../model-view/model.component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxLoadingModule} from 'ngx-loading';
const routes = [
    {
        path     : 'quoteview',
        component: QuoteViewComponent
    }
];

@NgModule({
    declarations: [
        QuoteViewComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FuseSharedModule,
        MatFormFieldModule,
        MatIconModule,
        MatExpansionModule,
        ModelComponentModule,
        MatButtonModule,
        NgxLoadingModule,
        MatToolbarModule
    ],
    exports: [
        QuoteViewComponent
    ]
})

export class QuoteViewModule {
}
