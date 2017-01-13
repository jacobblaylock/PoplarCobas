import { Component, OnInit } from '@angular/core';

import { MssqlService } from './mssql.service';

import { Batch } from './batch';
import { Test } from './test';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit  {
    batchList: Batch[];
    batchListCount: number;
    batchDetails: Batch;
    errorMessage: string;
    selectedBatch: string;
    queryStatus: string;
    queryStatusMessage: string;

    constructor(private _mssql: MssqlService) {

    }

    reset() {
        if(this.batchList){this.batchList = [];}
        if(this.batchListCount){this.batchListCount = 0;}
        if(this.batchDetails){delete this.batchDetails;}
        if(this.errorMessage){this.errorMessage = '';}
        if(this.selectedBatch){this.selectedBatch = '';}
        this.getBatchData();
    }

    resetQueryStatus() {
        if(this.queryStatus){this.queryStatus = '';}
        if(this.queryStatusMessage){this.queryStatusMessage = '';}
    }

    ngOnInit() {
        this.getBatchData();
    }

    getBatchData() {
        this._mssql.getBatchData()
            .subscribe(
                data => this.batchList = data,
                error => this.errorMessage = <any>error,
                () => this.batchListCount = this.batchList.length
            )
    }

    getBatchDetail(batchNumber: string) {
        this._mssql.getBatchDetail(batchNumber)
        .subscribe(
            data => this.batchDetails = data,
            error => this.errorMessage = <any>error
        )
    }

    onBatchChange(batchNumber: string) {
        this.resetQueryStatus();
        this.getBatchDetail(batchNumber);
    }

    flagResult(test: Test) {
        if(test.result.indexOf('POS') > -1){
            return 'danger';
        }else{
            return '';
        }
    }

    releaseBatch() {
        this._mssql.releaseBatch(this.batchDetails.batchNumber, this.batchDetails.batchReleaseUser)
        .subscribe(
            data => {
                if(data.message.substring(0,1) === 'E'){
                    this.queryStatus = 'alert alert-danger';
                    this.queryStatusMessage = 'ERROR:  ';
                }else{
                    this.queryStatus = 'alert alert-success';
                    this.queryStatusMessage = 'SUCCESS:  '
                }
                this.queryStatusMessage += data.message;

            },
            error => this.errorMessage = <any>error,
            () => this.reset()
        )
    }

    rejectBatch() {
        this._mssql.rejectBatch(this.batchDetails.batchNumber, this.batchDetails.batchReleaseUser)
        .subscribe(
            data => {
                if(data.message.substring(0,1) === 'E'){
                    this.queryStatus = 'alert alert-danger';
                    this.queryStatusMessage = 'ERROR:  ';
                }else{
                    this.queryStatus = 'alert alert-success';
                    this.queryStatusMessage = 'SUCCESS:  '
                }
                this.queryStatusMessage += data.message;

            },
            error => this.errorMessage = <any>error,
            () => this.reset()
        )
    }

    getCurrentBatchDate(): Date {
        let date = new Date(this.batchDetails.batchDateString);
        return date;
    }

}
