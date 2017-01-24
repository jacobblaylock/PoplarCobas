import { Component, OnInit } from '@angular/core';

import { MssqlService } from './mssql.service';

import { Batch } from './batch-model';
import { Test } from './test-model';

@Component({
    moduleId: module.id,
    selector: '<batch-list></batch-list>',
    templateUrl: 'batch-list.component.html'
})
export class BatchListComponent implements OnInit {
    batchList: Batch[];
    batchListCount: number;
    errorMessage: string;
    selectedBatch: string;
    queryStatus: string;
    queryStatusMessage: string;

    constructor(private _mssql: MssqlService) {

    }

    batchDetailProcessed(event: any) {
        this.queryStatus = event.queryStatus;
        this.queryStatusMessage = event.queryStatusMessage;
        this.errorMessage = event.errorMessage;
        this.reset();
    }

    reset() {
        if(this.batchList){this.batchList = [];}
        if(this.batchListCount){this.batchListCount = 0;}
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

    // onBatchChange(batchNumber: string) {
    //     this.resetQueryStatus();
    //     this.getBatchDetail(batchNumber);
    // }

}