const http = require('http')
const {fileSave} = require('../dist/index.js')
http.createServer((req, res) => {
    fileSave(req, fileObj => {
        console.log(fileObj)
        /*{
          name: 'xx',  // name of input
          filename: 'list.txt',
          }*/
        // non-file data don't has filename.
        // if you save it as file, please return an Object that it's filename not equal null.
        if (fileObj.filename.match(/png|jpg|gif|jpge$/i)) {
            return {
                path: './asset/img',          //required    default:'./'
                filename: fileObj.filename, //required default: the same with fileObj
            }
        } else {
            return {
                path: './files',            //required   default:'./'
                filename: fileObj.filename,  //required default: the same with fileObj
            }
        }

    }).then(result => {
        console.log(result)
        /*[{
            success: true,
            filename: 'dog.png',
            name: 'xx',
            errorMsg: '',
            writePath: '/home/asset/img/dog.png'
          },
          {
            success: true,
            filename: 'index.js',
            name: 'xxx',
            errorMsg: '',
            writePath: '/home/files/index.js'
          }]*/
        res.end('updated')
    }).catch(result=>{
        console.log(result)
        /*{
            ContentType:"application/x-www-form-urlencoded",
            errorMsg:"A boundary value illegal,Please check the ContentType"
        }*/
    })
}).listen(3000,function (){console.log('listening in 3000  ...')})