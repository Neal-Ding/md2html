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
			case "template":
				resData = toTemplate(rawData, themeDir);
				break;
			default:
				break;
		}

		file.contents = new Buffer(resData, 'utf8');
		callback(null, file);
	});
};

/**
 * 转换为jade模板
 * @param  {String} rawData  原始数据
 * @param  {String} themeDir 当前主题目录，用来指定jade模板路径
 * @return {String}          转换后的模板可直接解析
 */
function toTemplate (rawData, themeDir) {
	var resData = rawData.replace(/@\{\S*\}/gi, themeDir);

	return resData;

}