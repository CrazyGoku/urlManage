<template>
  <div class="container">
    <el-container>
      <el-header class="header">
        <el-button @click="batchHandleVisible = true">批量操作</el-button>
        <el-button @click="addDialogVisible=true">添加</el-button>
        <el-upload
          class="upload-button"
          action="/api/upload"
          :http-request="uploadSectionFile"
          :multiple=false
          :limit="1"
        >
          <el-button size="small" type="primary">点击上传Excel</el-button>
        </el-upload>
        <el-input
          placeholder="请输入查询域名"
          v-model="keyWord"
          @keyup.enter.native="searchKeyword"
          @input="deleteKeyWord"
          prefix-icon="el-icon-search"
          @clear="clearKeyWord"
          clearable>
        </el-input>
      </el-header>
      <el-main>
        <el-table
          :data="dataList"
          @sort-change="sortData"
          @selection-change="handleSelectionChange">
          border>
          <el-table-column
            type="selection"
            :span="4"
          >
          </el-table-column>
          <el-table-column
            fixed
            prop="time"
            label="到期日期"
            sortable='custom'
            :span="5">
          </el-table-column>
          <el-table-column
            prop="url"
            label="域名地址"
            :span="5">
          </el-table-column>
          <el-table-column
            prop="platform"
            label="所属公司"
            :span="5">
          </el-table-column>
          <el-table-column
            label="操作"
            :span="5">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" circle @click='singleEditInfo(scope.row)'></el-button>
              <el-button type="danger" icon="el-icon-delete" circle @click="deleteOneData(scope.row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 20px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="totalNum">
        </el-pagination>
      </el-main>
    </el-container>
    <!--添加域名 弹出框-->
    <el-dialog class="dialog" title="添加域名" :visible.sync="addDialogVisible">
      <el-form :model="form">
        <el-form-item label="域名" :label-width="formLabelWidth">
          <el-input v-model="form.url" auto-complete="off" placeholder="请输入域名"><i slot="prefix"
                                                                                  class="el-input__icon el-icon-edit"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="所属公司" :label-width="formLabelWidth">
          <el-input v-model="form.platform" type="string" auto-complete="off" placeholder="请输入公司"><i slot="prefix"
                                                                                                     class="el-input__icon el-icon-edit"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="到期时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="form.time"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="addHangle">确 定</el-button>
      </div>
    </el-dialog>
    <!--批量操作弹出框-->
    <el-dialog class="dialog" title="批量操作" :visible.sync="batchHandleVisible">
      <el-form :model="form">
        <el-form-item label="操作" :label-width="formLabelWidth">
          <el-button icon="el-icon-delete" @click='batchDetale'>删除</el-button>
        </el-form-item>
        <el-form-item label="到期时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="form.time"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelBatchHandle">取 消</el-button>
        <el-button type="primary" @click="batchHandle">确 定</el-button>
      </div>
    </el-dialog>
    <!--操作一条数据-->
    <el-dialog class="dialog" title="编辑域名" :visible.sync="editDialogVisible">
      <el-form :model="form">
        <el-form-item label="域名" :label-width="formLabelWidth">
          <el-input v-model="form.url" type="string" auto-complete="off" placeholder="请输入域名"><i slot="prefix"
                                                                                                class="el-input__icon el-icon-edit"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="所属公司" :label-width="formLabelWidth">
          <el-input v-model="form.platform" type="string" auto-complete="off" placeholder="请输入公司"><i slot="prefix"
                                                                                                     class="el-input__icon el-icon-edit"></i>
          </el-input>
        </el-form-item>
        <el-form-item label="到期时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="form.time"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="singleEditInfoSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {getData, addData, deleteData, updateData, findKeyWord, fileUpload} from '@/server/dashbord'
  import {mapGetters, mapMutations} from 'vuex';
  export default {
    name: 'dashbord',
    data() {
      return {
        keyWord: "",
        dataList: [],
        multipleSelection: [],
        addDialogVisible: false,
        batchHandleVisible: false,
        editDialogVisible: false,
        formLabelWidth: '120px',
        form: {
          url: '',
          time: '',
          platform: ''
        },
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
        editData: {},
        editIndex: 0,
        loadingText:'Loading',
        isUpload:false
      }
    },
    computed:{
      ...mapGetters([
        'loadingAction'
      ])
    },
    watch:{
      loadingAction:{
        handler:function (newValue) {
          let loading = this.$loading({
            lock: true,
            text: this.loadingText,
            spinner: 'el-icon-loading',
            background: 'rgba(225, 225,225, 0.7)'
          });
          if(!newValue){
            loading.close();
            if(!this.isUpload){
              this.loadingText = 'Loading'
            }
          }
        }
      }
    },
    methods: {
      uploadSectionFile:function (param) {
        this.loadingText = '数据上传中'
        this.isUpload = true
        var fileObj = param.file;
        var form = new FormData();
        form.append("uploadFile", fileObj);
        fileUpload(form).then((res) =>{
          if(res.data.code){
            this.refreshData().then(res=>{
              this.isUpload = false
              this.notify('数据上传成功')
            });
          }
        });
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      // 清除查询条件
      clearKeyWord() {
        this.refreshData()
      },
      deleteKeyWord() {
        if (this.keyWord.length === 0) {
          this.refreshData()
        }
      },
      // 提示消息
      notify(msg) {
        const h = this.$createElement;
        this.$notify({
          title: '提示',
          message: h('span', {style: 'color: teal'}, msg)
        });
      },
      // 获取勾选的数据
      handleSelectionChange(val) {
        console.log(val)
        this.multipleSelection = val;
      },

      handleSizeChange(val) {
        this.currentPage = 1
        this.pageSize = val
        if (this.keyWord !== '') {
          this.searchKeyword()
        } else {
          this.refreshData()
        }
      },
      // 翻页
      handleCurrentChange(val) {
        this.currentPage = val
        if (this.keyWord !== '') {
          this.searchKeyword()
        } else {
          this.refreshData()
        }
      },
      // 保存编辑
      singleEditInfo(e) {
        console.log(e)
        this.editData = [e]
        this.editDialogVisible = true
      },
      singleEditInfoSave() {
        if (this.form.url) {
          this.editData[0].url = this.form.url
        }
        if (this.form.time) {
          this.editData[0].time = this.dateParse(this.form.time)
        }
        if (this.form.platform) {
          this.editData[0].platform = this.form.platform
        }
        if (this.form.url === '' && this.form.time === '' && this.form.platform === '') {
          this.$message({
            message: '警告哦，需要填写编辑的内容~',
            type: 'warning'
          });
          return
        }
        updateData(this.editData).then(res => {
          if (res.data.code == 1) {
            this.form = {}
            this.editDialogVisible = false
          }
        })
      },
      // 取消编辑
      cancelEdit() {
        this.editDialogVisible = false
        this.form = {}
      },
      // 取消添加
      cancelAdd() {
        this.addDialogVisible = false
        this.form = {}
      },
      // 添加操作
      addHangle() {
        if( this.form.url===''||this.form.time===''||this.form.platform===''){
          this.$message({
            message: '警告哦，需要填写完内容~',
            type: 'warning'
          });
          return
        }
        let params = this.form
        addData(params).then(res => {
          if (res.data.code === 1) {
            this.refreshData().then(res=>{
              this.form = {}
              this.addDialogVisible = false
              this.notify('添加成功')
            })
          } else {
            this.notify(res.data.msg)
          }
        })
      },
      // 取消批量操作
      cancelBatchHandle() {
        this.batchHandleVisible = false
        this.form = {}
      },
      // 批量编辑
      batchHandle() {
        if (this.form.time === '') {
          this.$message({
            message: '警告哦，需要填写编辑的内容~',
            type: 'warning'
          });
          return
        }
        let editData = this.multipleSelection
        editData.map(item => {
          item.time = this.dateParse(this.form.time)
        })
        updateData(editData).then(res => {
          if (res.data.code == 1) {
            this.form = {}
            this.notify('编辑成功')
            this.editDialogVisible = false
          } else {
            this.notify(res.data.msg)
          }
        })
        this.batchHandleVisible = false
      },
      // 排序
      sortData(e) {
        if (this.keyWord !== '') {
          this.searchKeyword(e.order)
        } else {
          this.refreshData(e.order)
        }
      },
      //删除一条信息
      deleteOneData(row) {
        let {_id} = row
        let params = {
          ids: [_id]
        }
        this.$confirm('是否删除本条数据？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteData(params).then(res => {
            if (res.data.code === 1) {
              this.refreshData().then(res=>{
                this.notify('删除成功')
              })
            } else {
              this.notify('删除失败')
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      //批量删除
      batchDetale() {
        if (this.multipleSelection.length) {
          let params = {
            ids: []
          }
          this.multipleSelection.map(item => {
            params.ids.push(item._id)
          })
          this.$confirm('是否删除多条数据？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteData(params).then(res => {
              if (res.data.code === 1) {
                this.refreshData().then(res=>{
                  this.notify('删除成功')
                  this.batchHandleVisible=false
                })
              } else {
                this.notify('删除失败')
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        } else {
          this.$message({
            type: 'warning',
            message: '未选择信息'
          });
        }

      },
      // 关键字查询
      searchKeyword(sort) {
        let params = {
          pageSize: this.pageSize,
          currentPage: this.currentPage,
          keyWord: this.keyWord
        }
        if (sort) {
          params.sortType = sort
        }
        findKeyWord(params).then(res => {
          if (res.data.code === 1) {
            if (res.data.totalNum > 0) {
              res.data.data.map(item => {
                item.time = this.dateParse(item.time)
              })
              this.dataList = res.data.data
              this.totalNum = res.data.totalNum
            } else {
              this.$message({
                type: 'warning',
                message: '未找到关键字'
              });
            }
          } else {
            this.$message({
              type: 'warning',
              message: res.data.msg
            });
          }
        })
      },
      dateParse(time) {
        let parseTime = new Date(time)
        let y = parseTime.getFullYear()
        let m = parseTime.getMonth() + 1
        let d = parseTime.getDate()
        return y + '-' + m + '-' + d
      },
      refreshData(sort) {
        return new Promise(resolve => {
          let params = {
            pageSize: this.pageSize,
            currentPage: this.currentPage
          }
          if (sort) {
            params.sortType = sort
          }
          getData(params).then(res => {
            if (res.status === 200) {
              console.log(res.data)
              resolve()
              res.data.data.map(item => {
                item.time = this.dateParse(item.time)
              })
              this.dataList = res.data.data
              this.totalNum = res.data.totalNum
            }
          })
        })
      }
    },
    mounted() {
      this.refreshData()
    }
  }
</script>
<style scoped>
  .container {
    padding: 20px;
  }

  .header {
    padding: 0;
    margin: 0 20px;
    background: #ebeef5;
    border-radius: 10px;
    box-shadow: 1px 1px 5px #b0b0b0;
    line-height: 60px;
    display: flex;
    justify-content: start;
    align-items: center;
    padding-left: 20px;
  }

  .header button {
    height: 40px;
  }

  .header .el-input {
    width: 200px;
    margin-left: 20px;
  }

  .dialog .el-input {
    width: 220px;
  }
  .el-upload-list{
    display: none;
  }
  .upload-button{
    height: 40px;
    margin-left: 10px;
    width: 100px;
  }
  .upload-button button{
    position: relative;
    top: -10px;
  }
</style>
