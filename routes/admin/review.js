/**
 * 发币审核模块
 */
const express = require('express');
const router = express.Router();
const Applycan = require('../../schemaDao/Applycan');
const mongoose = require('mongoose');
const axios = require('axios');
const Promise = require('promise');
const commonUtils = require('../../utils/commonUtils');
// 查询发币信息 /admin/review
router.get('/', function(req, res, next){
    let query = {};
    // 上一页的最后一条记录的id
    let lastid = req.query.lastid;
    if(lastid){
        query._id = {
            $lt: mongoose.Types.ObjectId(lastid)
        }
    }
    // 手机号
    let telphone = req.query.telphone;
    // 开始日期
    let startDate = req.query.startDate;
    // 结束日期
    let endDate = req.query.endDate;
    // 查询状态 0全部 1未处理 2同意 3拒绝
    let status = req.query.status;
    
    if(telphone){
        query.telphone = telphone;
    }
    if(status == 1){
        query.isdeal = 1; // 查询未处理的数据
    }else if(status == 2){
        query.isdeal = 2; // 查询同意的数据
    }else if(status == 3){
        query.isdeal = 3; // 查询拒绝的数据
    }else{
        // 查询全部数据
    }
    try {
        undefined==startDate?'':new Date(startDate).toISOString();
        undefined==endDate?'':new Date(endDate).toISOString();
    } catch (error) {
        res.json({code: 201, msg: '时间格式不正确'});
        return;
    }
    
    if(startDate && endDate){
        startDate = new Date(startDate).toISOString();
        endDate = new Date(endDate).toISOString();
        if(startDate <= endDate){
            query.createtime = {
                '$gte': startDate,
                '$lte': endDate
            }
        }else {
            res.json({code: 203, msg: '开始时间不能大于结束时间'});
            return;
        }
    }else if(startDate && !endDate){
        startDate = new Date(startDate).toISOString();
        endDate = new Date().toISOString();
        query.createtime = {
            '$gte': startDate,
            '$lte': endDate
        }
    }else if(!startDate && endDate){
        res.json({code: 202, msg: '开始时间不能为空'});
        return;
    }

    Applycan.find(query, function(err, applycans){
        if(!err && applycans){
            res.json({code: 200, msg: 'success', results: applycans});
        }else{
            res.json({code: 204, msg: '查询失败'});
        }
    }).limit(commonUtils.pagesize);
});

// 操作发币信息 /admin/review/oper
router.get('/oper', function(req, res, next){
    // ids 一个数组，可以多选操作
    let ids = req.query.ids; // 1,2,3,4,5
    
    if(!ids){
        res.json({code: 201, msg: 'ids不能为空'});
        return;
    }
    // 操作状态 2,3
    let isdeal = req.query.status;
    if(!isdeal){
        res.json({code: 201, msg: '操作状态不能为空'});
        return;
    }
    ids = ids.split(',');
    ids = ids.map(element => {
        return mongoose.Types.ObjectId(element);
    });
    let query = {
        _id: {
            $in: ids
        }
    }
    Applycan.update(query, {
        $set: {
            isdeal: isdeal
        }
    },function(err, c){
        if(!err && c){
            res.json({code: 200, msg: '操作成功', modifycount: c});
        }else{
            res.json({code: 201, msg: '操作失败'});
        }
    })
});
const Excel = require('exceljs');
// 导出到excel
router.get('/xlsx', function(req, res, next){
    // 手机号
    let telphone = req.query.telphone;
    // 开始日期
    let startDate = req.query.startDate;
    // 结束日期
    let endDate = req.query.endDate;
    // 查询状态 0全部 1未处理 2同意 3拒绝
    let status = req.query.status;
    let query = {};
    if(telphone){
        query.telphone = telphone;
    }
    if(status === 1){
        query.isdeal = 1; // 查询未处理的数据
    }else if(status === 2){
        query.isdeal = 2; // 查询同意的数据
    }else if(status === 3){
        query.isdeal = 3; // 查询拒绝的数据
    }else{
        // 查询全部数据
    }
    try {
        ''==startDate?'':new Date(startDate).toISOString();
        ''==endDate?'':new Date(endDate).toISOString();
    } catch (error) {
        res.json({code: 201, msg: '时间格式不正确'});
        return;
    }

    if(startDate && endDate){
        startDate = new Date(startDate).toISOString();
        endDate = new Date(startDate).toISOString();
        if(startDate <= endDate){
            query.createtime = {
                '$gte': startDate,
                '$lte': endDate
            }
        }else {
            res.json({code: 203, msg: '开始时间不能大于结束时间'});
            return;
        }
    }else if(startDate && !endDate){
        startDate = new Date(startDate).toISOString();
        endDate = new Date().toISOString();
        query.createtime = {
            '$gte': startDate,
            '$lte': endDate
        }
    }else if(!startDate && endDate){
        res.json({code: 202, msg: '开始时间不能为空'});
        return;
    }

    let promise = new Promise(function(resolve, reject){
        Applycan.find(query, function(err, applycans){
            if(!err && applycans){
                resolve({code: 200, msg: 'success', results: applycans});
            }else{
                reject({code: 204, msg: '导出表格时数据查询失败'});
            }
        });
    });

    promise
    .then(function(value){
        console.log(value);
        let workbook = new Excel.Workbook();
        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        workbook.views = [
            {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
        ]

        let worksheet = workbook.addWorksheet('Sheet1');
        let headers = [
            { header: '序号', key: '_id',width: 10 },
            { header: '绑定手机号', key: 'telphone',width: 10 },
            { header: '申请日期',  key: 'createtime',width: 20 },
            { header: 'ETH地址', key: 'imtoken',width: 10 },
            { header: 'IP地址', key: 'ip',width: 10 },
            { header: '申请CAN数量', key: 'cancount', width: 20 },
            { header: '状态', key: 'isdeal', width: 20 }
        ]

        // 生成标题头
        worksheet.columns = headers;
        let rows = value.results;
        rows = rows.map(function(ele){
            let isdeal = ele.isdeal;
            isdeal===1?ele.isdeal='未处理':(isdeal===2?ele.isdeal='同意':ele.isdeal='拒绝');
            return ele;
            // if(ele.isdeal === 1){
            //     ele.isdeal = '未处理';
            // }else if(ele.isdeal === 2){
            //     ele.isdeal = '同意';
            // }else{
            //     ele.isdeal = '拒绝'
            // }
            // return ele;
        });
        worksheet.addRows(rows);

        res.set('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'youlan');
        res.set('Set-Cookie', 'fileDownload=true; path=/');
        res.attachment("test.xlsx");
        workbook.xlsx.write(res)
        .then(function() {
            res.end();
        });
    })
    .catch(function(value){
        res.end();
    });
});


module.exports = router;