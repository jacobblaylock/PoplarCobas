import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { MssqlService } from './mssql.service';
import { AuthService } from './auth.service';

import { Batch } from './batch-model';
import { Test } from './test-model';

@Component({
    moduleId: module.id,
    selector: '<batch-detail></batch-detail>',
    templateUrl: 'batch-detail.component.html'
})
export class BatchDetailComponent implements OnInit, OnChanges {
    batchDetails: Batch;
    errorMessage: string;
    @Input() batchNumber: string;
    @Output() done = new EventEmitter;
    queryStatus: string;
    queryStatusMessage: string;

    constructor(private mssql: MssqlService, private auth: AuthService) {

    }

    ngOnChanges() {
        this.getBatchDetail(this.batchNumber);
    }

    ngOnInit() {

    }

    reset() {
        if(this.batchNumber){this.batchNumber = ''}
        if(this.batchDetails){delete this.batchDetails}
        if(this.errorMessage){this.errorMessage = ''}
        this.done.emit({queryStatus: this.queryStatus, queryStatusMessage: this.queryStatusMessage, errorMessage: this.errorMessage});

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

    getBatchDetail(batchNumber: string) {
        this.mssql.getBatchDetail(batchNumber)
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
            () => this.batchDetails.batchReleaseUser = this.auth.currentUser
        )
    }

    flagResult(test: Test) {
        if(test.result.indexOf('POS') > -1){
            return 'danger';
        }else{
            return '';
        }
    }

    releaseBatch() {
        this.mssql.releaseBatch(this.batchDetails.batchNumber, this.batchDetails.batchReleaseUser)
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
        this.mssql.rejectBatch(this.batchDetails.batchNumber, this.batchDetails.batchReleaseUser)
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