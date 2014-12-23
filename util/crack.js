var http = require("http"),
	fs = require("fs"),
	result = {};

var opt = {
	host: "192.168.1.1",
	port: 80,
	path: "/",
	auth: "admin:admin",
	method: "GET"
};
var req = http.request(opt, function(res) {
	console.log('STATUS: ' + res.statusCode);
});

req.on('error', function(e) {
	console.log(e);
});

req.end();

// $.ajax({
//	url: "192.168.1.1",
//	type: "get",
//	beforeSend: function (xhr) {
//		xhr.setRequestHeader('Authorization', "Basic YWRtaW46YWRtaW4=");
//	},
//	success: function (data) {
//		console.log(data);
//	}
// });