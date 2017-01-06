var sql = require('mssql');


var CobasDI = function(){
    this.config = {
        user: 'PMT',
        password: 'PMT@Mirth1',
        server: 'localhost',
        database: 'CobasDI',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
}

CobasDI.prototype.getBatches = function(callback){
    sql.connect(this.config).then(function(){

        var query = 'EXEC stprc_get_batch'

        new sql.Request()
        .query(query).then(function(recordset){
            //console.log(recordset);
            callback(recordset);
        }).catch(function(err){
           // console.log(error);
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

formatBatchDetail = function(recordset, callback){
    var batchDetail = {};
    batchDetail.batchNumber = recordset[0].batchNumber;
    batchDetail.batchRunUser = recordset[0].batchRunUser;
    batchDetail.details = [];

    recordset.forEach(function(row){
        if(!batchDetail.details.find(b => b.accessionNumber === row.accessionNumber)){
            var tests = [];
            recordset.forEach(function(row2){
                if(row2.accessionNumber === row.accessionNumber){
                    tests.push({
                        code: row2.code,
                        result: row2.result
                    })
                }
            })

            batchDetail.details.push({
                accessionNumber: row.accessionNumber,
                tests: tests
            })
        }
    })
    callback(batchDetail);
}

module.exports = CobasDI;