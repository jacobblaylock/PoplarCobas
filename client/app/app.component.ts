import { Component, OnInit } from '@angular/core';

import { MssqlService } from './mssql.service';

import { Batch } from './batch';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit  {
    batchList: Batch[];
    batchDetails: any[];
    errorMessage: string;
    selectedBatch: string;

    constructor(private _mssql: MssqlService) {

    }

    ngOnInit() {
        this.getBatchData();
    }

    getBatchData() {
        this._mssql.getBatchData()
            .subscribe(
                data => this.batchList = data,
                error => this.errorMessage = <any>error
            )
    }

    getBatchDetail(batchNumber: string) {
        this._mssql.getBatchDetail(batchNumber)
        .subscribe(
            data => this.batchDetails = data.details,
            error => this.errorMessage = <any>error
        )
    }

    onBatchChange(batchNumber: string) {
        this.getBatchDetail(batchNumber);
    }

}
