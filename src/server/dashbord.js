import {URL} from '../config/index.js'
import axios from 'axios'
export function getData(params) {
  return new Promise(resolve => {
    axios.get('/api/data',{
      params
    })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}

export function addData(params) {
  params.time = Date.parse(params.time)
  return new Promise(resolve => {
    axios.post('/api/addData',params)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}

export function deleteData(params) {
  return new Promise(resolve => {
    axios.post('/api/deleteData',params)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}

export function updateData(params) {
  return new Promise(resolve => {
    axios.post('/api/update',params,{headers: {'Content-Type': 'multipart/form-data'}})
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}

export function findKeyWord(params) {
  return new Promise(resolve => {
    axios.get('/api/findData',{params})
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}


export function fileUpload(params) {
  return new Promise(resolve => {
    axios.post('/api/upload',params)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}

export function expiryData() {
  return new Promise(resolve => {
    axios.post('/api/expiryData')
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log(err)
      })
  })
}
