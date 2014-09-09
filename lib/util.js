var path = require('path');
var fs = require('fs');

module.exports = {
	getLatesetMdByDir: function (dir) {
		if(dir.charAt(dir.length - 1) !== '/'){
			dir = dir.concat("/");
		}
		var files = fs.readdirSync(dir);
		var statue = {};
		for (var i = 0; i < files.length; i++) {
			var itemStatue = fs.statSync(dir + files[i]);
			//path.extname won't detect whether the path link to a file or not
			if(itemStatue.isFile() && path.extname(files[i]) === ".md"){
				if(!statue.LatestTime || (statue.LatestTime.getTime() < itemStatue.mtime.getTime())){
					statue.LatestItem = files[i];
					statue.LatestTime = itemStatue.mtime;
				}
			}
		};
		statue.LatestTime = statue.LatestTime.getFullYear() + "-" + (statue.LatestTime.getMonth() + 1) + "-" + statue.LatestTime.getDate();
		return statue;
	}
}