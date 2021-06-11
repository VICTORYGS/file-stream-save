const fs = require('fs')
const path = require('path')
const querystring = require('querystring')
class fileStreamSave {
    constructor() {
        this.writeF = null
        this.fileMsg = null
    }
    mkdir(dir,cb) {
        let pathinfo = path.parse(dir)
        if (!fs.existsSync(pathinfo.dir)) {
            this.mkdir(pathinfo.dir,function() {
                fs.mkdirSync(pathinfo.dir)
            })
        }
        cb&&cb()
    }
    register(fileMsg, fileOpt) {
        let fileObj = querystring.decode(fileMsg.toString(), '; ', '=')
        fileObj={
            filename:fileObj.filename.replace(/^"|"$/g, ''),
            name:fileObj.name.replace(/^"|"$/g, ''),
        }
        this.fileMsg={
            success:true,
            ...fileObj,
            errorMsg:''
        }
        if (typeof fileOpt == 'function') {
            fileOpt = fileOpt(fileObj)
        }else if(!fileOpt){
            fileObj.path='./'
            fileOpt=fileObj
        }
        if (fileOpt.filename) {
            let writePath = path.resolve(fileOpt.path,fileOpt.filename)
            /*// node 10
            if(!fs.existsSync(writePath)){
                fs.mkdirSync(writePath,{recursive: true })
            }*/
            this.mkdir(writePath,_=>{
                this.writeF = fs.createWriteStream(writePath)
                this.fileMsg.writePath=writePath
            })
        } else {
            this.fileMsg.errorMsg="it's not file data or value of filename is null"
            this.fileMsg.success=false
            // console.warn('fileSave: Some non-file data has been filtered')
        }
    }

    write(d) {
        // console.log(this.writeF);
        this.writeF&&this.writeF.write(d, e => {
            if (e) {
                console.error(e)
            }
        })
    }

    close() {
        if (this.writeF) {
            this.writeF.end()
        }
    }
}

exports.fileSave=function (req, fileOpt) {
    return new Promise((r,j)=>{
        let boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
        if(!boundary){
            console.warn('A boundary value illegal')
            j({
                ContentType:req.headers['content-type'],
                errorMsg:"A boundary value illegal,Please check the content-type"
            })
            return
        }
        let start = '--' + boundary + '\r\n'
        let end = '--' + boundary + '--'
        let bufRes = Buffer.alloc(0)
        let que = []
        let flag = 0
        let lock = 0

        function bufResAdd(d) {
            bufRes = Buffer.concat([bufRes, d])
            if (lock) return;
            lock = 1
            for (; ;) {
                if (bufRes.indexOf(end) == 0 || bufRes.length == 0) {
                    return lock = 0
                }
                let i = bufRes.indexOf(start)
                // consume one by one
                if (flag == 0 && i == 0) {// init
                    que.unshift(new fileStreamSave)
                    bufRes = bufRes.slice(i + start.length)
                    flag = 1//进入文件名处理
                } else if (flag == 1) {
                    let wrapIndex = bufRes.indexOf('\r\n')
                    que[0].register(bufRes.slice(0, wrapIndex), fileOpt)
                    bufRes = bufRes.slice(wrapIndex + 2)
                    flag = 11
                } else if (flag == 2 && i > -1) {// content write and finish
                    que[0].write(bufRes.slice(0, i));
                    bufRes = bufRes.slice(i)
                    flag = 0
                } else if (flag == 2) {// content write
                    que[0].write(bufRes);
                    bufRes = Buffer.alloc(0)
                } else if (flag == 11) {
                    let indexWrap = bufRes.indexOf('\r\n')
                    if (indexWrap == 0) {
                        flag = 2
                        bufRes = bufRes.slice(2)
                    } else {
                        bufRes = bufRes.slice(2 + indexWrap)
                    }
                }
            }
        }

        req.on('data', d => {
            bufResAdd(d)
        }).on('end', _ => {
            let saveResArr=[]
            que.forEach(ins => {
                saveResArr.push(ins.fileMsg)
                ins.close()
            })
            r(saveResArr)
        })
    })
}
