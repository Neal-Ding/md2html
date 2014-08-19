var	gulp = require('gulp');
	jade = require('gulp-jade');
	markdown = require('gulp-markdown');
	watch = require('gulp-watch');
	concat = require('gulp-concat');
	cssMin = require('gulp-minify-css');
	jsMin = require('gulp-uglify');
	connect = require('gulp-connect');
	fs = require('fs');
	path = require('path');
	highlight = require('highlight.js')
	opt = null;
	sourcePath = null;


gulp.task('config', function () {
	var data = fs.readFileSync('./config.json', 'utf-8');
	var today = new Date();//获得当前日期
	var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
	opt = JSON.parse(data);
	opt.date = date;
	sourcePath = {
		"css": 'theme/' + opt.theme + '/static/*.css',
		"script": 'theme/' + opt.theme + '/static/*.js',
		"template": 'theme/' + opt.theme + '/template/section.jade',
		"md": 'source/*.md'
	};
})

gulp.task('css', ['config'], function () {
	return gulp.src(sourcePath.css)
		.pipe(concat('page.css'))
		.pipe(cssMin())
		.pipe(gulp.dest('./target/css/'));
})

gulp.task('script', ['config'], function () {
	return gulp.src(sourcePath.script)
		.pipe(concat('page.js'))
//		.pipe(jsMin())
		.pipe(gulp.dest('./target/js/'));
})

gulp.task('markdown', ['config'], function () {
	var latest = getLatesetMdByDir(path.dirname(sourcePath.md))
	opt.lastModify = latest.LatestTime;

	return gulp.src(sourcePath.md)
		.pipe(concat('page.md'))
		.pipe(markdown({
			highlight: function (code) {
				return highlight.highlightAuto(code).value;
			}
		}))
		.pipe(gulp.dest('./theme/' + opt.theme + '/template/'));
})

gulp.task('template', ['markdown', 'css', 'script'], function () {
	var orgData = fs.readFileSync('./theme/' + opt.theme + '/template/page.html', 'utf-8');

	var r4 = /<(h[1-6]).*?>.*?<\/\1>/gi;
	var r5 = /-\{[^\}]+\}/gi;

	var resData = orgData.replace(r4, function (w){
		var level = w.split("<h")[1][0];
		var content = w.split(">")[1].split("<")[0];
		var result = "<h" + level + " id=\"" + content + "\">" + content + "</h" + level + ">";
		return result;
	});


	fs.writeFileSync('./theme/' + opt.theme + '/template/page.html', resData, 'utf-8');

	return gulp.src(sourcePath.template)
		.pipe(jade({
			locals: opt,
			pretty: true
		}))
		.pipe(gulp.dest('./target/html/'))
		.pipe(connect.reload());
})

gulp.task('watch', function () {

	gulp.watch(sourcePath.css, ['css', 'template']);
	gulp.watch(sourcePath.script, ['script', 'template']);
	gulp.watch(sourcePath.template, ['template']);
	gulp.watch(sourcePath.md, ['template']);
})

gulp.task('connect', function() {
	connect.server({
		root: 'target/html/',
		livereload: true
	});
});

gulp.task('default', ['config', 'css', 'script', 'template', 'watch', 'connect'])

function getLatesetMdByDir (dir) {
	if(dir.charAt(dir.length - 1) !== '/'){
		dir = dir.concat("/");
	}
	var files = fs.readdirSync(dir);
	var statue = {};
	for (var i = 0; i < files.length; i++) {
		var itemStatue = fs.statSync(dir + files[i]);
		//path.extname won't detect whether the path link to a file or not
		if(itemStatue.isFile() && (path.extname(files[i]) === ".md")){
			if(!statue.LatestTime || (statue.LatestTime.getTime() < itemStatue.mtime.getTime())){
				statue.LatestItem = files[i];
				statue.LatestTime = itemStatue.mtime;
			}
		}
	};
	statue.LatestTime = statue.LatestTime.getFullYear() + "-" + (statue.LatestTime.getMonth() + 1) + "-" + statue.LatestTime.getDate();
	return statue;
}