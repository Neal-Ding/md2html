var es = require('event-stream');

/**
 * 各种转换方法集
 * @param  {String} type     指定转换类型
 * @param  {String} themeDir 当前主题类型
 * @return {Stream}          返回流数据，gulp可直接调用
 */
module.exports = function (type, themeDir) {
	return es.map(function (file, callback) {

		var rawData = file.contents.toString('utf8');
		var resData = null;
		switch(type){
			case "anchor":
				resData = toAnchor(rawData);
				break;
			case "template":
				resData = toTemplate(rawData, themeDir);
				break;
			default:
				break;
		}

		file.contents = new Buffer(resData, 'utf8');
		callback(null, file);
	})
}

/**
 * 针对文件中的标题生成链接，默认根据标题生成对应锚点，支持@{}指定锚点链接
 * @param  {String} rawData 原始数据
 * @return {String}         转换后的数据
 */
function toAnchor (rawData) {
	var r4 = /<(h[1-6]).*?>.*?<\/\1>/gi;
	var r5 = /-\{[^\}]+\}/gi;
	var r6 = /\@\{[^\}]+\}/gi;
	var replaceHeadingTagReg = /<(h\d)[^<]*>/gi;
	var replaceHeaderConReg = / *[-\@]\{[^\}]+\}/gi;

	var resData = rawData.replace(r4, function(w){
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

/**
 * 转换为jade模板
 * @param  {String} rawData  原始数据
 * @param  {String} themeDir 当前主题目录，用来指定jade模板路径
 * @return {String}          转换后的模板可直接解析
 */
function toTemplate (rawData, themeDir) {
	var resData = rawData.replace(/\r/gi, "\r        ").replace(/\n/gi, "\n        ");

	return "extends /theme/" + themeDir + "/template/layout\n\n" + "block content\n\n" + "    :markdown\n" + "        " + resData;

}