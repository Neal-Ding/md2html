var path = require('path');
var fs = require('fs');

module.exports = {
	/**
	 * 获取当前目录下指定文件类型的最近修改时间
	 * @param  {String} dir
	 * @param  {String} ext
	 * @return {Object}
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
		};
		if(Object.keys(statue).length){
			statue.LatestTime = statue.LatestTime.getFullYear() + "-" + (statue.LatestTime.getMonth() + 1) + "-" + statue.LatestTime.getDate();
		}
		return statue;
	}
}