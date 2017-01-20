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

    handleSqlError(data: any) {
        if(data.message.indexOf('ECONNREFUSED')>0){
            this.errorMessage = `ERROR: Unable to connect to the database.
                Verify you are connected to the Poplar network and refresh the page.
                If the problem persists, contact IT support.  DETAILS:
                ` + data.message;
        }else{
            this.errorMessage = 'ERROR:  ' + data.message;
        }
    }

    getBatchData() {
        this._mssql.getBatchData()
            .subscribe(
                data => {
                    if(data.name){
                        if(data.name.toUpperCase().indexOf('ERROR') > 0){
                            this.handleSqlError(data);
                        }
                    }else{
                        this.batchList = data;
                    }
                },
                error => this.errorMessage = <any>error,
                () => {
                    if(!this.errorMessage){
                        this.batchListCount = this.batchList.length;
                    }
                }
            )
    }

    getBatchDetail(batchNumber: string) {
        this._mssql.getBatchDetail(batchNumber)
        .subscribe(
            data => {
                if(data.name){
                    if(data.name.toUpperCase().indexOf('ERROR') > 0){
                        this.handleSqlError(data);
                    }
                }else{
                    this.batchDetails = data;
                }
            },
            error => this.errorMessage = <any>error,
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
