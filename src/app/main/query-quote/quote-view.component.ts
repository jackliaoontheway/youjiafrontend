import {Component, forwardRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import {FormBuilder, FormControl} from '@angular/forms';
import {QueryQuoteModel} from '../../model/queryquote.model';
import {ExpandTableComponent} from './expand-table/expand-table.component';
import {BaseModel} from '../../model/base.model';
import {ModelService} from '../../service/model.service';
import {FieldspecModel} from '../../model/fieldspec.model';
import {ModelspecModel} from '../../model/modelspec.model';


@Component({
    selector: 'quote-view',
    templateUrl: './quote-view.component.html',
    styleUrls: ['./quote-view.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class QuoteViewComponent implements OnInit, OnDestroy {
    entity: QueryQuoteModel;
    searchCriteria: BaseModel;
    fieldSpecs: Array<FieldspecModel>;
    modelSpec: ModelspecModel;
    @Input()
    tabValue: string;
    searchInput: FormControl;
    // 调用子组件
    @ViewChild(forwardRef(() => ExpandTableComponent), { static: false })
    expandTableList: ExpandTableComponent;
    serviceUrl: string;
    
    constructor(
        private _formBuilder: FormBuilder,
        private _modelService: ModelService
    ) {
        this.entity = new QueryQuoteModel();
        this.searchInput = new FormControl('');
    }
    
    ngOnInit(): void {
        this.serviceUrl = '/quoteSchemes/';
        this._modelService.fetchMetadata( this.serviceUrl).then(mSpecs => {
            if (mSpecs && mSpecs.length > 0) {
                this.fieldSpecs = mSpecs[0].fieldSpecs;
                this.modelSpec = mSpecs[0];
            }
        });
    }
    
    ngOnDestroy(): void {
    
    }

    onKeyPress(event: any, searchElm: any): void {
        if (event.keyCode === 13) {
            this.onSearch(searchElm);
        }
    }
    
    onFocus(searchElm: any): void {
        searchElm.setSelectionRange(0, this.searchInput.value.length);
    }
    
    
    onSearch(searchElm: any): void {
        const searchText = this.searchInput.value;
        // if (this.searchCriteria == null) {
        this.searchCriteria = this._generateCriteria(searchText);
        // }
        this.searchCriteria.smartSearchText = searchText;
        searchElm.setSelectionRange(0, this.searchInput.value.length);
        this.expandTableList.searchCriteria = this.searchCriteria;
        // this.viewType = 'list';
        this.expandTableList.onPageChange(this.expandTableList.currentPage, this.expandTableList.pageSize);
    }
    
    private _generateCriteria(searchText: string): BaseModel {
        const cri = new BaseModel();
        const fNames = this.modelSpec.searchField.split(',');
        for (const fName of fNames) {
            const attrNames = fName.trim().split('.');
            if (attrNames == null || attrNames.length === 0) {
                return cri;
            }
            let m = cri;
            for (let i = 0; i < attrNames.length - 1; i++) {
                m[attrNames[i]] = new BaseModel();
                m = m[attrNames[i]];
            }
            m[fName.substr(fName.lastIndexOf('.') + 1)] = searchText;
        }
        return cri;
    }
    
    
    getSearchFieldLabel(fieldName: string): string {
        const fNames = fieldName.split(',');
        let searchLabel = '';
        for (const fName of fNames) {
            searchLabel = searchLabel + this._getSearchFieldLabel(this.fieldSpecs, fName.trim());
        }
        return searchLabel.substr(0, searchLabel.length - 1);
    }
    
    private _getSearchFieldLabel(fSpecs: FieldspecModel[], fName: string): string {
        let searchLabel = '';
        if (fName === null || fName.length === 0) {
            return searchLabel;
        }
        if (fName.indexOf('.') === -1) {
            for (const fSpec of fSpecs) {
                if (fSpec.name === fName) {
                    return fSpec.label + '/';
                }
            }
        } else {
            const attrName = fName.substring(0, fName.indexOf('.'));
            for (const fSpec of fSpecs) {
                if (fSpec.name === attrName) {
                    searchLabel = fSpec.label + '.' + this._getSearchFieldLabel(fSpec.componentMetaDatas,
                        fName.substring(fName.indexOf('.') + 1));
                }
            }
        }
        return searchLabel;
    }
}
