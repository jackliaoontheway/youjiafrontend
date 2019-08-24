import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class MatPaginatorIntlCro extends MatPaginatorIntl {
    private _translateService: TranslateService;

    getRangeLabel = function (page, pageSize, length): string {
        const of = this._translateService ? this._translateService.instant('Paginator.of') : 'of';
        const nodata = this._translateService ? this._translateService.instant('Paginator.no_data') : 'No data';
        if (length === 0 || pageSize === 0) {
            return nodata;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
    };

    injectTranslateService(translate: TranslateService): void {
        this._translateService = translate;

        this._translateService.onLangChange.subscribe(() => {
            this.translateLabels();
        });

        this.translateLabels();
    }

    translateLabels(): void {
        this.itemsPerPageLabel = this._translateService.instant('Paginator.items_per_page');
        this.nextPageLabel = this._translateService.instant('Paginator.next_page');
        this.previousPageLabel = this._translateService.instant('Paginator.previous_page');
        this.firstPageLabel = this._translateService.instant('Paginator.first_page');
        this.lastPageLabel = this._translateService.instant('Paginator.last_page');
        this.changes.next();
    }
}
