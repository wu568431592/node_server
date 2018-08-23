var qiniu = require('qiniu');
var express = require('express');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var captchapng = require('captchapng');
var svgCaptcha = require('svg-captcha');
const svg2png = require("svg2png");
var bodyParser = require('body-parser')
var db = require('./db')


var multipartMiddleware = multipart();

var upload = multer({
    dest: './images'
});

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//设置请求头，允许跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else  next();
});
app.get('/', function(req, res){
    res.send('hello world');
});

app.get('/api/getToken',(req, res)=>{
    var accessKey = 'bv0-nmNo-kd8cNuVFzaIijx75fRBCA8d-sShpcNu';
    var secretKey = 'V12blzsBvmH2P0r9cKu-7Xlwm5pSL6VL6E2ouk3m';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var bucket = 'backup-img'
    var options = {
        scope: bucket,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken=putPolicy.uploadToken(mac);
    res.send({
        code:200,
        message:'success',
        data:{
            Token:uploadToken
        }
    })
})
app.post('/api/post', multipartMiddleware ,function(req,res){
    //将表单中name是name_txt的input元素中的文本内容取出
    var txtFromFront = req.body.name_txt;
    var data = [];
    try {
        console.log(Array.isArray(req.files.imageFile))
        if(Array.isArray(req.files.imageFile)){
            for(let i = 0;i<req.files.imageFile.length;i++){
                console.log(1)
                //获取上传的文件的文件名和绝对路径,注意先引入fs和path模块
                let oriNameOfFile = req.files.imageFile[i].originalFilename || path.basename(req.files.imageFile[i].ws.path);
                let oriPathOfFile = req.files.imageFile[i].path;
                console.log(oriNameOfFile)
                //定义文件的输出路径，我在此处没有改变上传的文件名，具体可以按照需求改变输出路径和文件名
                let targetPathOfFile = './upload/' + oriNameOfFile;
                //读取和输出文件到目标路径
                fs.readFile(oriPathOfFile,function (err, data) {
                    fs.writeFile(targetPathOfFile,data,function (err) {
                        //console.log(data)
                        if(err){
                            console.log('文件在存储过程中出错了：' + err);
                            //res.send({result:"fail",reason:"保存文件失败"});//将消息发送(回复)给请求的ajax
                        }else {
                            console.log('File saved successfully!');
                            //res.send({result:"success"});//将消息发送(回复)给请求的ajax
                        }
                    });
                });
                data.push('http://127.0.0.1:8888/upload/'+req.files.imageFile[i].originalFilename)
            }
            console.log(data)
            res.send({
                errno:0,
                data:data
            });
        }else{
            let oriNameOfFile = req.files.imageFile.originalFilename || path.basename(req.files.imageFile.ws.path);
            let oriPathOfFile = req.files.imageFile.path;
            console.log(oriNameOfFile)
            //定义文件的输出路径，我在此处没有改变上传的文件名，具体可以按照需求改变输出路径和文件名
            let targetPathOfFile = './upload/' + oriNameOfFile;
            //读取和输出文件到目标路径
            fs.readFile(oriPathOfFile,function (err, data) {
                fs.writeFile(targetPathOfFile,data,function (err) {
                    //console.log(data)
                    if(err){
                        console.log('文件在存储过程中出错了：' + err);
                        //res.send({result:"fail",reason:"保存文件失败"});//将消息发送(回复)给请求的ajax
                    }else {
                        console.log('File saved successfully!');
                        //res.send({result:"success"});//将消息发送(回复)给请求的ajax
                    }
                });
            });
            data.push('http://127.0.0.1:8888/upload/'+req.files.imageFile.originalFilename)
            console.log(data)
            res.send({
                errno:0,
                data:data
            });
        }

    }catch (e) {
        console.log(e);
        res.send({result:"fail",reason:"保存文件失败"});
    }
})

// 单域多文件上传：input[file]的 multiple=="multiple"
app.post('/uploads', upload.array('imageFile', 15), function(req, res, next) {
    let data = [];
    // req.files 是 前端表单name=="imageFile" 的多个文件信息（数组）,限制数量5，应该打印看一下
    for (let i = 0; i < req.files.length; i++) {
        // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
        // 对临时文件转存，fs.rename(oldPath, newPath,callback);
        fs.rename(req.files[i].path, "upload/" + req.files[i].originalname, function(err) {
            if (err) {
                throw err;
            }
            console.log('done!');
        })
        data.push('http://127.0.0.1:8888/upload/'+req.files[i].originalname)
    }

    res.send({
        errno:0,
        data:data
    });
    // req.body 将具有文本域数据, 如果存在的话
})

// 单域单文件上传：input[file]的 multiple != "multiple"
app.post('/upload', upload.single('imageFile'), function(req, res, next) {
    // req.file 是 前端表单name=="imageFile" 的文件信息（不是数组）
    fs.rename(req.file.path, "upload/" + req.file.originalname, function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功!');
    })
    var url = 'http://127.0.0.1:8888/upload/'+req.file.originalname
    console.log(url)
    res.send({
        "errno": 0,
        "data": [
            url
        ]
    })
})

app.get('/upload/:name',function(req, res){
    fs.readFile('./upload/'+req.params.name,'binary',function(err, file) {
        if (err) {
            console.log(err);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write("can't find file")
            res.end();
            return;
        }else{
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.write(file,'binary');
            res.end();
            return;
        }
    });
})


app.post('/api/editorUpload', multipartMiddleware ,function(req, res){
    //console.log(req.body.html);

    res.send({
        result:true
    })
})

app.get('/captcha.png',function(req, res){
    var num = parseInt(Math.random()*9000+1000)
    var p = new captchapng(80,30,num); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
})
app.get('/captcha',function(req, res){
    var captcha = svgCaptcha.create({
        size: 5, // 验证码长度
        ignoreChars: '0o1iUuVv', // 验证码字符中排除 0o1i
        noise: 5, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#cc9966' // 验证码图片背景颜色
    });
    //req.session.captcha = captcha.text;
    console.log(captcha.text)


    res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    res.status(200).send(captcha.data);

})

app.get('/captchaCompute',function(req, res){
    var captcha = svgCaptcha.createMathExpr({
        size: 5, // 验证码长度
        ignoreChars: '0o1iUuVv', // 验证码字符中排除 0o1iUuVv
        noise: 5, // 干扰线条的数量
        color: '#fff', // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#e4393c' // 验证码图片背景颜色
    });
    //req.session.captcha = captcha.text;
    console.log(captcha.text)
    svg2png(captcha.data, { width: 150, height: 50 })
        .then( buffer => fs.writeFile("./upload/dest.png", buffer,function (err) {
            if(err){
                console.log(err)
            }else{

            }
        }))
        .catch(e => console.error(e));
    res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    res.status(200).send(captcha.data);
})

app.post('/api/login',(req, res)=>{
    const { login } = db
    let phone = req.body.phone
    let password = req.body.password
    if(!phone || !password){
        res.send({
            code:200,
            message:'error',
            data:{}
        })
    }
    login( phone )
        .then( payload =>{
            if( payload[0].password && payload[0].password == password){
                res.send({
                    code:200,
                    message:'success',
                    data:{}
                })
            }else{
                res.send({
                    code:200,
                    message:'error',
                    data:{}
                })
            }

        })
        .catch(err=>{
            console.log(err)
            res.send({
                code:200,
                message:'error',
                data:{
                    error:err
                }
            })
        })

})



app.listen(8888);
console.log('服务器已经启动')
