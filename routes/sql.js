var express = require('express');
var router = express.Router();
var mssql = require('../server/mssql')

var cobasDI = new mssql();

router.get('/getBatches', function(req, res, next){
    cobasDI.getBatches(function(cb){
        res.send(cb);
    })
})

router.get('/getBatchDetail/:number', function(req, res, next){
    cobasDI.getBatchDetail(req.params.number, function(cb){
        res.send(cb);
    })
})

router.put('/releaseBatch/:number', function(req, res, next){
    cobasDI.releaseBatch(req.params.number, req.body.user, function(cb){
        res.send(cb[0]);
    })
})

router.put('/rejectBatch/:number', function(req, res, next){
    cobasDI.rejectBatch(req.params.number, req.body.user, function(cb){
        res.send(cb[0]);
    })
})

module.exports = router;