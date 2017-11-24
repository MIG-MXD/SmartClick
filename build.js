const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const del = require('del')

let packageJson = {}
if (fsExistsSync('./package.json')) {
  packageJson = require('./package.json')
} else {
  console.error('Error: 项目根目录没有package.json，无法build')
  return
}
const babelOption = {
  'presets': ['es2015', 'stage-0', 'react'],
  'plugins': [
    'transform-runtime'
  ]
}
const promps = []
  //组件库版本号
promps.push({
  type: 'input',
  name: 'release',
  default: packageJson.version,
  message: '请输入组件库版本号，参考旧版',
  validate: function (input){
    if(!input) {
      return '不能为空'
    }
    return true
  }
})

inquirer.prompt(promps).then(function (answer) {
  console.info('正在build...')
  del.sync('./build')
  funMkdirSync('./build')
  const jsPromise = new Promise((resolve, reject) => {
    babel.transformFile('./index.js', babelOption, (error, result) => {
      if (!error) {
        resolve(result)
      } else {
        reject(new Error(error))
      }
    })
  })
  jsPromise.then((result) => {
    fs.writeFileSync('./build/index.js', result.code)
    //生成新版本号的package.json
    packageJson.version = answer.release
    const newJson = JSON.stringify(packageJson, null, '  ')
    packageJson['pre-commit'] = {}
    delete packageJson['pre-commit']
    const buildJson = JSON.stringify(packageJson, null, '  ')
    fs.writeFileSync('./build/package.json', buildJson)
    fs.writeFileSync('./package.json', newJson) //更新项目的版本号 与build的一致
    process.stdout.write('build成功\n')
    process.exit(0)
    return true
  }).catch((error) => {
    console.error('编译./index.js失败: ' + error)
    return false
  })
})

//检测文件或者文件夹存在
function fsExistsSync(path) {
  try{
    fs.accessSync(path, fs.F_OK)
  }catch(e){
    return false
  }
  return true
}
//使用时第二个参数可以忽略  
function funMkdirSync(dirpath,dirname){
  //判断是否是第一次调用  
  if(typeof dirname === "undefined"){
    if(fsExistsSync(dirpath)){
      return;
    }else{
      funMkdirSync(dirpath,path.dirname(dirpath));
    }
  }else{
    //判断第二个参数是否正常，避免调用时传入错误参数
    if(dirname !== path.dirname(dirpath)){
      funMkdirSync(dirpath);
      return;
    }
    if(fsExistsSync(dirname)){
      fs.mkdirSync(dirpath)
    }else{
      funMkdirSync(dirname,path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }
}