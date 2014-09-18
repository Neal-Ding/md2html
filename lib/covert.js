var fs = require('fs'),
	es = require('event-stream');

module.exports = {
	covertTo: function (type, themeDir) {
		return es.map(function (file, callback) {
			var backup = file.clone();
			var orgData = backup.contents.toString('utf8');
			var resData = null;

			switch(type){
				case "anchor":
					resData = toAnchor(orgData);
					break;
				case "template":
					resData = toTemplate(orgData, themeDir);
					break;
				default:
					break;
			}

			backup.contents = new Buffer(resData);
			callback(null, backup);
		})
	}
}

function toAnchor (orgData) {
	var r4 = /<(h[1-6]).*?>.*?<\/\1>/gi;
	var r5 = /-\{[^\}]+\}/gi;
	var r6 = /\@\{[^\}]+\}/gi;
	var replaceHeadingTagReg = /<(h\d)[^<]*>/gi;
	var replaceHeaderConReg = / *[-\@]\{[^\}]+\}/gi;

	var resData = orgData.replace(r4, function(w){
		if(w.match(r6)){
			var anchor = w.match(r6)[0];
		}
		var emptyAnchors = w.match(r5);

		var emptyDivStr = '';
		if(emptyAnchors){
			for(var idx = 0; idx < emptyAnchors.length; idx++){
				var emptyACon = emptyAnchors[idx].match(/[^-\{\}]+/gi);
				emptyDivStr += '<div id="'+ emptyACon +'"></div>';
			}
		}

		if(anchor){
			w = w.replace(replaceHeadingTagReg, function(word, tag){
				return '<'+ tag +' id="'+ anchor.match(/[^\@\{\}]+/gi) +'">';
			});
		}
		else{
			var level = w.split("<h")[1][0];
			var content = w.split(">")[1].split("<")[0];
			var result = "<h" + level + " id=\"" + content + "\">" + content + "</h" + level + ">";
			return result;
		}

		w = w.replace(replaceHeaderConReg,function(word){
			return '';
		});

		return emptyDivStr + w;
	});
	return resData;
}

function toTemplate (orgData, themeDir) {

	var resData = orgData.replace(/\r\n/gi, function () {
		return "\r\n        ";
	});
	return "extends /theme/" + themeDir + "/template/layout\n\n" + "block content\n\n" + "    :markdown\n" + "        " + resData;

}