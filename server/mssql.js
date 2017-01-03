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
            //console.log(recordset);
            callback(recordset);
        }).catch(function(err){
            //console.log('ERROR: ' + error);
            callback(error);
        });
    });
}

module.exports = CobasDI;