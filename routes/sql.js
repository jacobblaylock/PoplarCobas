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

module.exports = router;