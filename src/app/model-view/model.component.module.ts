import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuseConfirmDialogModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { MatPaginatorIntlCro } from 'app/model-view/list/paginator-i18n';
import { ModelListComponent } from 'app/model-view/list/model-list.component';
import { ModelViewComponent } from 'app/model-view/model-view.component';
import { ModelSelectionDialogComponent } from 'app/model-view/list/model-list.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ModelTabComponent } from 'app/model-view/tab-detail-form/model-tab.component';
import { ModelPopComponent } from 'app/model-view/pop-detail-form/model-pop.component';
import { FieldDetailComponent } from 'app/model-view/component/field-detail.component';
import { FieldFormComponent } from 'app/model-view/component/field-form.component';
import { TableDialogComponent } from 'app/model-view/component/table-dialog.component';
import { PhotoDialogComponent } from 'app/model-view/component/photoDialog/photo-dialog.component';
import { SearchFieldComponent } from 'app/model-view/component/advanceSearch/search-field.component';

import { NgxLoadingModule } from 'ngx-loading';
import { GrantFunctionalityToUserroleComponent } from 'app/main/systemmgmt/grant-functionality-to-userrole/grant-functionality-to-userrole.component';
import { UsergroupManagementComponent } from 'app/main/systemmgmt/usergroup-management/usergroup-management.component';
import { AddUserToUserGroupComponent } from 'app/main/systemmgmt/add-user-to-user-group/add-user-to-user-group.component';
import { MatTreeModule } from '@angular/material/tree';
import {ExpandTableComponent} from '../main/query-quote/expand-table/expand-table.component';
import {MatCardModule} from '@angular/material';
import {QuoteDialogComponent} from '../main/query-quote/expand-table/quote-dialog/quote-dialog.component';
import {QuoteDialogTableComponent} from '../main/query-quote/expand-table/quote-dialog/quote-dialog-table/quote-dialog-table.component';
import {PlaceOrderDialogComponent} from '../main/query-quote/expand-table/placeOrder/place-order-form.component';
import {EditFeeItemComponent} from '../main/query-quote/expand-table/editFeeItem/edit-fee-item.component';
import {SetBubbleRateComponent} from '../main/query-quote/expand-table/setBubbleRate/set-bubble-rate.component';

@NgModule({
    declarations: [
        ModelViewComponent,
        ModelListComponent,
        ModelPopComponent,
        FieldDetailComponent,
        FieldFormComponent,
        TableDialogComponent,
        PhotoDialogComponent,
        ExpandTableComponent,
        QuoteDialogTableComponent,
        PlaceOrderDialogComponent,
        EditFeeItemComponent,
        SetBubbleRateComponent,
        QuoteDialogComponent,
        ModelTabComponent,
        SearchFieldComponent,
        GrantFunctionalityToUserroleComponent,
        UsergroupManagementComponent,
        AddUserToUserGroupComponent,
        ModelSelectionDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FuseSharedModule,
        FuseConfirmDialogModule,

        TranslateModule,
        FileUploadModule,

        FlexLayoutModule,

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatTabsModule,
        MatExpansionModule,
        MatSelectModule,
        MatOptionModule,
        MatDialogModule,
        MatRadioModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatTreeModule,
        NgxLoadingModule.forRoot({
            backdropBackgroundColour: 'rgba(221,221,221,0.47)',
            primaryColour: '#039be5',
            secondaryColour: '#039be5',
            tertiaryColour: '#039be5'
        }),
        MatCardModule
    ],
    providers: [{
        provide: MatPaginatorIntl, useFactory: (translate) => {
            const service = new MatPaginatorIntlCro();
            service.injectTranslateService(translate);
            return service;
        },
        deps: [TranslateService],
    }],

    exports: [
        ModelViewComponent,
        ModelListComponent,
        ModelTabComponent,
        ExpandTableComponent
    ],
    entryComponents: [
        ModelPopComponent,
        ModelSelectionDialogComponent,
        ModelListComponent,
        TableDialogComponent,
        PhotoDialogComponent,
        QuoteDialogComponent,
        ExpandTableComponent,
        QuoteDialogTableComponent,
        PlaceOrderDialogComponent,
        EditFeeItemComponent,
        SetBubbleRateComponent,
        SearchFieldComponent,
        GrantFunctionalityToUserroleComponent,
        UsergroupManagementComponent,
        AddUserToUserGroupComponent
    ]
})
export class ModelComponentModule {
}


