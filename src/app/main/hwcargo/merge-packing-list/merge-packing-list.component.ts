import { Component, OnInit, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { environment } from 'environments/environment';
import { FormControl } from '@angular/forms';
import { RestfulService } from 'app/service/restful.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-merge-packing-list',
  templateUrl: './merge-packing-list.component.html',
  styleUrls: ['./merge-packing-list.component.scss']
})

export class MergePackingListComponent implements OnInit {

  uploader: FileUploader = null;
  orderNumInput: FormControl;
  showLoading = false;

  constructor(private translate: TranslateService, private service: RestfulService, public snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    this.uploader = new FileUploader({ removeAfterUpload: true });
    this.uploader.setOptions({ url: environment.baseUrl + '/mergePackingList/upload' });
    this.orderNumInput = new FormControl('');
  }

  onFileSelected(event: EventEmitter<File[]>): void {
    this.showLoading = true;
    const data = new FormData();
    for (let i = 0; i < this.uploader.queue.length; i++) {
      const file = this.uploader.queue[i]._file;
      data.append('files', file);
    }

    this.uploader.clearQueue();
    
    data.append('three8number', this.orderNumInput.value);
    const url = '/mergePackingList/upload';
    
    this.service.uploadFile(url, data).then(fileName => {
      if (fileName) {
        this.showLoading = false;
        this.openSnackBar(this.translate.instant('upload-file-success'), 'Success');
        this.service.downloadCall('/mergePackingList/download?fileName=' + fileName, fileName, 'xls', false);
      } else {
        this.showLoading = false;
        this.openSnackBar(this.translate.instant('upload-file-fail'), 'Error');
      }
    });

  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
