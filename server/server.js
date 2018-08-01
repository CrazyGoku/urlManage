var express = require('express')
var bodyParser = require('body-parser')
var Url = require('./Urldb')
var xlsx = require('node-xlsx');
var fs = require('fs')
var formidable = require('formidable');
var explant = {
  __v: 0
}


/*Url.remove({},function (err,doc) {
  console.log(doc)
})*/
// 新建app
var app = express()

app.use(express.static('public'));
app.use(bodyParser.json())
app.use(bodyParser());
// 获取数据
app.get('/api/data', function (req, res) {
  var filterParams = {
    limit: Number(req.query.pageSize) || 1000,
    skip: Number(req.query.currentPage) - 1 || 0
  }
  if (req.query.sortType) {
    if (req.query.sortType === 'ascending') {
      filterParams.sort = {'time': 1}
    } else {
      filterParams.sort = {'time': -1}
    }
  }
  Url.count({}, function (err, count) {
    Url.find({}, explant, filterParams, function (err, doc) {
      if (doc) {
        var docTo = {
          totalNum: count,
          data: doc,
          code: 1
        }
        res.json(docTo)
      } else {
        res.json({code: 0})
      }
    })
  })


})

// 查找数据
app.get('/api/findData', function (req, res) {
  var filterParams = {
    limit: Number(req.query.pageSize) || 1000,
    skip: Number(req.query.currentPage) - 1 || 0
  }
  if (req.query.sortType) {
    if (req.query.sortType === 'ascending') {
      filterParams.sort = {'time': 1}
    } else {
      filterParams.sort = {'time': -1}
    }
  }
  var reg = new RegExp(req.query.keyWord, 'i')
  Url.count({url: reg}, function (err, count) {
    Url.find({url: reg}, explant, filterParams, function (err, doc) {
      if (doc) {
        var docTo = {
          totalNum: count,
          data: doc,
          code: 1
        }
        res.json(docTo)
      } else {
        res.json({code: 0, msg: '系统错误'})
      }
    })
  })
})

// 添加数据
app.post('/api/addData', function (req, res) {
  var url = req.body.url, time = req.body.time, platform = req.body.platform
  Url.findOne({url: url}, function (err, doc) {
    if (doc) {
      return res.json({code: 0, msg: '域名重复'})
    }
    Url.create({
      url: url,
      time: time,
      platform: platform
    }, function (err, doc) {
      if (err) {
        return res.json({code: 0, msg: '后端错误'})
      }
      return res.json({code: 1})
    })
  })
})

// 删除数据
app.post('/api/deleteData', function (req, res) {
  var ids = req.body.ids
  if (ids.length === 1) {
    Url.findOneAndDelete({_id: ids[0]}, function (err, doc) {
      if (doc) {
        return res.json({code: 1})
      } else {
        return res.json({code: 0, msg: '未能成功删除'})
      }
    })
  } else {
    var isRemoveAll = true
    console.log(ids)
    ids.forEach(function (item) {
      Url.findOne({_id: item}, function (err, doc) {
        if (doc) {
          Url.remove({_id: {$in: item}}, function (err, doc) {
            if (err) {
              isRemoveAll = false
            }
          })
        } else {
          isRemoveAll = false
        }
      })
    })
    if (isRemoveAll) {
      return res.json({code: 1})
    } else {
      return res.json({code: 0, msg: '含有未查找到的域名'})
    }
  }
})

// 更新数据
app.post('/api/update', function (req, res) {
  var reqData = req.body
  reqData.map(item => {
    item.time = Date.parse(item.time)
  })
  var isUpdateAll = true
  var _id, url, time, platform
  for (var i in reqData) {
    _id = reqData[i]._id
    url = reqData[i].url
    time = reqData[i].time
    platform = reqData[i].platform
    Url.findByIdAndUpdate(_id, {$set: {url, time, platform}}, function (err, doc) {
      if (err) {
        isUpdateAll = false
      }
    })
  }
  if (isUpdateAll) {
    return res.json({code: 1})
  } else {
    return res.json({code: 0, msg: '含有未查找到的域名'})
  }
})
app.post('/api/upload', function (req, res) {
  // 新建一个form 传入上传的文件 用xlsx格式化传入的文件 遍历  如果有的话就更新 没有就创建
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var file = files.uploadFile
    var list = xlsx.parse(file.path);
    var data = list[0].data
    var uploadAll = true
    console.log(data)
    data.forEach(function (data, index) {
      if (index > 0) {
        data[4] = new Date(1900, 0, data[4] - 1)
        var updata = {
          url: data[0],
          time: data[4],
          platform: data[5]
        }
        Url.findOne({url: updata.url}, function (err, doc) {
          if (doc) {
            var _id = doc._id
            Url.findByIdAndUpdate(_id, {$set: updata}, function (err, doc) {
              if (err) {
                uploadAll = false
              }
            })
          } else {
            Url.create(updata, function (err, doc) {
              if (err) {
                uploadAll = false
              }
            })
          }
        })
      }
    })
    if (uploadAll) {
      res.json({code: 1})
    } else {
      res.json({code: 0, msg: '后端错误'});
    }
  })
});

// 获取快到期的数据

app.get('/api/expiryData', function (req, res) {
  var nowDate = new Date()
  var reg = new RegExp(req.query.keyWord, 'i')
  var totalNum = 0
  Url.count({url: reg}, function (err, count) {
    totalNum = count
  })
  Url.find({url: reg}, explant, function (err, doc) {
    if (doc) {
      var docTo = {
        totalNum,
        data: doc,
        code: 1
      }
      res.json(docTo)
    } else {
      res.json({code: 0, msg: '系统错误'})
    }
  })
})

// 时间戳转换
function fmtDate(obj) {
  var date = new Date(obj);
  var y = 1900 + date.getYear();
  var m = "0" + (date.getMonth() + 1);
  var d = "0" + date.getDate();
  return y + "/" + m.substring(m.length - 2, m.length) + "/" + d.substring(d.length - 2, d.length);
}

// 导出数据
app.get('/api/exportData', function (req, res) {
  var explantData = {
    _id: 0,
    __v: 0
  }
  Url.find({}, explantData, function (err, doc) {
    if (doc) {
      var dataCon = []
      dataCon[0] = []
      dataCon[0].push('域名', '到期时间', '平台')
      doc.forEach(function (item, index) {
        dataCon[index + 1] = []
        dataCon[index + 1].push(item['url'], fmtDate(item['time']), item['platform'])
      })
      var data = [{
        name: 'firstsheet',
        data: dataCon
      }]
      fs.writeFile('urlsExport.xlsx', xlsx.build(data), 'utf8',function (err) {
        if(err){
          res.json({code: 0, msg: '系统错误'})
        }else{
          fs.rename('./urlsExport.xlsx','./public/static/urlsExport.xlsx',function (err) {
            if(err){
              res.json({code: 0, msg: '系统错误'})
            }else{
              res.json({code: 1})
            }
          })

        }
      })

    } else {
      res.json({code: 0, msg: '系统错误'})
    }
  })
})
app.listen(3123, function () {
  console.log('Node app start at port 3123')
})
