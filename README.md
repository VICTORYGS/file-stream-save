# file-stream-save
A NodeJS plugin for receiving and storing file streams.
* Files will be received and written as streams
## Installing

Using npm:

```bash
$ npm install file-stream-save
```


Using yarn:

```bash
$ yarn add file-stream-save
```



## Example

### Client
Content-Type need to equal "multipart/form-data"

```html
<form method="post" action="http://localhost:3000" enctype="multipart/form-data">
    <input type="file" name="xx"/>
    <input type="submit" value="submit"/>
</form>
```

### Server

```js
const http = require('http')
const {fileSave} = require('file-stream-save')
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
```


## file-stream-save API

##### fileSave(request,[fileOpt])
fileOpt can be a Function or an object
```js
// fileOpt is Object
fileSave(req,{
    path: './asset/img',          //required    default:'./'
    filename: fileObj.filename, //required default: the same with fileObj
});
```

```js
// fileOpt is Function
fileSave(req,fileObj => {
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

});
```


## License

[MIT](LICENSE)
