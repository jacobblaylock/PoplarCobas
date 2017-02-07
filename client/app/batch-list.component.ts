import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MssqlService } from './mssql.service';
import { AuthService } from './auth.service';

import { Batch } from './batch-model';
import { Test } from './test-model';

@Component({
    moduleId: module.id,
    templateUrl: 'batch-list.component.html'
})
export class BatchListComponent implements OnInit {
    batchList: Batch[];
    batchListCount: number;
    errorMessage: string;
    selectedBatch: string;
    queryStatus: string;
    queryStatusMessage: string;

    constructor(private mssql: MssqlService, private auth: AuthService, private router: Router) {

    }

    ngOnInit() {
        this.getBatchData();
    }

    batchDetailProcessed(event: any) {
        this.queryStatus = event.queryStatus;
        this.queryStatusMessage = event.queryStatusMessage;
        this.errorMessage = event.errorMessage;
        this.reset();
    }

    getBatchData() {
        this.mssql.getBatchData()
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

    // logout() {
    //     this.auth.reset();
    //     this.reset();
    //     this.resetQueryStatus();
    //     this.router.navigate(['/login']);
    // }

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

}