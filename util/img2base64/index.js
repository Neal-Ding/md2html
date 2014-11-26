var http = require("http"),
	fs = require("fs"),
	result = {};

var testUrl = 'http://cc2e.com/_img/cc2e-cover-small.gif';

http.get(testUrl, function (res) {
	var getData = "";

	res.setEncoding("base64");
	res.on('data', function (temp) {
		getData += temp;
	});
	res.on('end', function () {
		result["img1"] = {
			url: testUrl,
			data: "data:" + res.headers['content-type'] + ";base64," + getData
		};
		console.log(result.img1.url);
		console.log(result.img1.data);
	});
});
