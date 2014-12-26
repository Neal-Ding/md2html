var http = require("http"),
	fs = require("fs"),
	url = require('url'),
	path = require('path'),
	result = {};

// var testUrl = 'http://cc2e.com/_img/cc2e-cover-small.gif';

// http.get(testUrl, function (res) {
// 	var getData = "";

// 	res.setEncoding("base64");
// 	res.on('data', function (temp) {
// 		getData += temp;
// 	});
// 	res.on('end', function () {
// 		result["img1"] = {
// 			url: testUrl,
// 			data: "data:" + res.headers['content-type'] + ";base64," + getData
// 		};
// 		console.log(result.img1.url);
// 		console.log(result.img1.data);
// 	});
// });

http.createServer(function (req, res) {
	var pathname = url.parse(req.url).pathname;
	var localPath = '.' + pathname;
    var ext = path.extname(pathname);
	fs.exists(localPath, function (exists) {
		if(exists){
			staticResHandler(localPath, ext, res); //静态资源
		}
	})
}).listen(3232);

//处理静态资源
function staticResHandler(localPath, ext, response) {
    fs.readFile(localPath, "binary", function (error, file) {
        if (error) {
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Server Error:" + error);
        } else {
            response.writeHead(200, { "Content-Type":  getContentTypeByExt(ext)});
            response.end(file, "binary");
        }
    });
}



//得到ContentType
function getContentTypeByExt(ext) {
    ext = ext.toLowerCase();
    if (ext === '.htm' || ext === '.html')
        return 'text/html';
    else if (ext === '.js')
        return 'application/x-javascript';
    else if (ext === '.css')
        return 'text/css';
    else if (ext === '.jpe' || ext === '.jpeg' || ext === '.jpg')
        return 'image/jpeg';
    else if (ext === '.png')
        return 'image/png';
    else if (ext === '.ico')
        return 'image/x-icon';
    else if (ext === '.zip')
        return 'application/zip';
    else if (ext === '.doc')
        return 'application/msword';
    else
        return 'text/plain';
}