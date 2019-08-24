import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { MergePackingListComponent } from './merge-packing-list/merge-packing-list.component';
import { FileUploadModule } from 'ng2-file-upload';
import { MatCardModule, MatDialogModule, MatSnackBarModule } from '@angular/material';
import { SearchMawbPackingListComponent } from './search-mawb-packing-list/search-mawb-packing-list.component';
import { NgxLoadingModule } from 'ngx-loading';


const routes = [{
  path: 'hwcargo',
  children: [
    { path: 'mergePackingList', component: MergePackingListComponent },
    { path: 'searchPackingList', component: SearchMawbPackingListComponent }
  ]
}];

@NgModule({
  declarations: [MergePackingListComponent, SearchMawbPackingListComponent],
  imports: [
    RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule,
        FileUploadModule,
        FuseSharedModule,
        NgxLoadingModule.forRoot({
          backdropBackgroundColour: 'rgba(221,221,221,0.47)',
          primaryColour: '#039be5',
          secondaryColour: '#039be5',
          tertiaryColour: '#039be5'
      }),

  ],
  
  exports: [
    MergePackingListComponent
  ]
})
export class HwcargoModule { }
