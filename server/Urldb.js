var mongoose = require('./mongoose.js')
var Url = mongoose.model('Url',new mongoose.Schema({
  url:{type:String,require:true},
  time:{type:Number,require:true},
  platform:{type:String,require:true}
}))
module.exports = Url
