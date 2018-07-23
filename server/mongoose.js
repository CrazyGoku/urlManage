var mongoose = require('mongoose')
// 链接mongo 并且使用urlManager
var DB_URL = 'mongodb://localhost:27017/urlmanager'
mongoose.connect(DB_URL)
mongoose.connection.on('connected',function () {
  console.log('mogo connected')
})
module.exports = mongoose
