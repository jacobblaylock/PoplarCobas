var sql = require('mssql');
var sqlConfig = require('../server.config.local.json');


var CobasDI = function(){
    this.config =  sqlConfig;
}

CobasDI.prototype.getBatches = function(callback){
    sql.connect(this.config).then(function(){

        var query = 'EXEC stprc_get_batch'

        new sql.Request()
        .query(query).then(function(recordset){
            callback(recordset);
        }).catch(function(err){
            console.log(error);
           callback(error);
        });
    });
}

CobasDI.prototype.getBatchDetail = function(batchNumber, callback){
    sql.connect(this.config).then(function(){

        var query = "EXEC stprc_get_batch_details '" + batchNumber + "'";

        new sql.Request()
        .query(query).then(function(recordset){
            formatBatchDetail(recordset, function(cb){
                callback(cb);
            })
        }).catch(function(err){
            //console.log('ERROR: ' + error);
            callback(error);
        });
    });
}

CobasDI.prototype.releaseBatch = function(batchNumber, user, callback) {
    sql.connect(this.config).then(function(){

        var query = "EXEC stprc_release_batch '" + batchNumber + "', '" + user + "'";

        new sql.Request()
        .query(query).then(function(recordset){
            callback(recordset);
        }).catch(function(err){
            console.log('ERROR: ' + error);
            callback(error);
        });
    });
}

CobasDI.prototype.rejectBatch = function(batchNumber, user, callback) {
    sql.connect(this.config).then(function(){

        var query = "EXEC stprc_reject_batch '" + batchNumber + "', '" + user + "'";

        new sql.Request()
        .query(query).then(function(recordset){
            callback(recordset);
        }).catch(function(err){
            //console.log('ERROR: ' + error);
            callback(error);
        });
    });
}

formatBatchDetail = function(recordset, callback){
    var batchDetail = {};
    batchDetail.batchNumber = recordset[0].batchNumber;
    batchDetail.batchDateString = recordset[0].batchDateString;
    batchDetail.batchRunUser = recordset[0].batchRunUser;
    batchDetail.cases = [];

    recordset.forEach(function(row){
        if(!batchDetail.cases.find(b => b.accessionNumber === row.accessionNumber)){
            var tests = [];
            recordset.forEach(function(row2){
                if(row2.accessionNumber === row.accessionNumber){
                    tests.push({
                        code: row2.code,
                        result: row2.result
                    })
                }
            })

            batchDetail.cases.push({
                accessionNumber: row.accessionNumber,
                tests: tests
            })
        }
    })
    callback(batchDetail);
}

module.exports = CobasDI;