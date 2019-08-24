export class PageResponse {
    nonceToken: string;
    totalRecords: number;
    totalPages: number;
    currentPageIndex: number;
    pageSize: number;
    dataList: Array<any>;
    statusList: Array<any>;
}
