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

    getBatchDetail() {
        this._mssql.getBatchDetail()
        .subscribe(
            data => this.batchDetails = data,
            error => this.errorMessage = <any>error
        )
    }

}
