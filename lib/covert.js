var fs = require('fs'),
	es = require('event-stream');

module.exports.covertMD = function () {
	function fn(file, callback) {
		var backup = file.clone();
		var orgData = backup.contents.toString('utf8');

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

			w = w.replace(replaceHeaderConReg,function(word){
				return '';
			});

			return emptyDivStr + w;
		});

		backup.contents = new Buffer(resData);
		callback(null, backup);
	}
	var stream = es.map(fn);
	return stream;
}