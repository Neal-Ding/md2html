var path = require('path'),
	util = require('gulp-util'),
	fs = require('fs'),
	es = require('event-stream'),
	cleanCSS = require('clean-css'),
	uglify = require('uglify-js'),
	jade = require('jade'),
	exec = require('child_process').exec,
	spawn = require('child_process').spawn;

module.exports = {
	/**
	 * 获取当前目录下指定文件类型的最近修改时间
	 * @param  {String} dir 指定目录
	 * @param  {String} ext 指定需要计算时间的文件名
	 * @return {Object} {LatestTime, LatestItem}    最新的文件和对应的时间"yy-mm-dd"
	 */
	getNewestFile: function (dir, ext) {
		if(dir.charAt(dir.length - 1) !== '/'){
			dir = dir.concat("/");
		}
		var files = fs.readdirSync(dir);

		var statue = {};
		for (var i = 0; i < files.length; i++) {
			var itemStatue = fs.statSync(dir + files[i]);
			//path.extname won't detect whether the path link to a file or not
			if(itemStatue.isFile() && path.extname(files[i]) === ext.toString()){
				if(!statue.LatestTime || (statue.LatestTime.getTime() < itemStatue.mtime.getTime())){
					statue.LatestItem = files[i];
					statue.LatestTime = itemStatue.mtime;
				}
			}
		}
		if(Object.keys(statue).length){
			statue.LatestTime = statue.LatestTime.getFullYear() + "-" + (statue.LatestTime.getMonth() + 1) + "-" + statue.LatestTime.getDate();
		}
		return statue;
	},
	/**
	 * 用cleanCSS来压缩CSS文件
	 * @param  {Object} option 传入的参数
	 * @return {String}        返回流数据
	 */
	cssMin: function (option) {
		return es.map(function (file, callback) {
			var rawData = file.contents.toString('utf8');
			var resData = new cleanCSS(option).minify(rawData);

			file.contents = new Buffer(resData);
			callback(null, file);
		});
	},
	/**
	 * 用uglify来压缩JS文件
	 * @param  {Object} option 传入的参数，会加入{"fromString": true}
	 * @return {String}        返回流数据
	 */
	jsMin: function (option) {
		return es.map(function (file, callback) {
			if(!option){
				option = {
					"fromString": true
				};
			}
			else{
				option.fromString = true;
			}
			var rawData = file.contents.toString('utf8');
			var resData = uglify.minify(rawData, option);

			file.contents = new Buffer(resData.code);
			callback(null, file);
		});
	},
	/**
	 * 用jade来解析模板文件,默认解析后转为html后缀
	 * @param  {Object} option 配置项
	 * @return {String}        返回流数据
	 */
	jade: function (option) {
		return es.map(function (file, callback) {
			var rawData = file.contents.toString('utf8');
			var resData = jade.compile(rawData, option)(option.locals || option.data);
			file.path = util.replaceExtension(file.path, '.html');

			file.contents = new Buffer(resData);
			callback(null, file);
		});
	},
	/**
	 * 执行不同系统自带命令用默认浏览器打开链接
	 * @param  {String} url 要打开的链接地址
	 */
	openURL: function (url) {
		switch(process.platform){
			case "darwin":
				exec('open ' + url);
				break;
			case "win32":
				exec('start ' + url);
				break;
			default:
				// spawn('xdg-open', [url]);  linux BUG
				//buffer issus, http://stackoverflow.com/a/16099450/222893
		}
	}
};