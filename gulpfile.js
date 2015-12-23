'use strict';

var	gulp = require('gulp'),
	path = require('path'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat'),
	connect = require('gulp-connect'),
	util = require('./lib/util'),
	covertTo = require('./lib/covertTo'),
	highlight = require('highlight.js'),
	opt = require('./config.json'),
	sourcePath = null;

gulp.task('config', function () {
	sourcePath = {
		"css": 'theme/' + opt.theme + '/static/*.css',
		"script": 'theme/' + opt.theme + '/static/*.js',
		"md": 'source/**/*.md'
	};
});

gulp.task('css', ['config'], function () {
	return gulp.src(sourcePath.css)
		.pipe(concat('page.css'))
		.pipe(util.cssMin())
		.pipe(gulp.dest('./target/css/'));
});

gulp.task('script', ['config'], function () {
	return gulp.src(sourcePath.script)
		.pipe(concat('page.js'))
		.pipe(util.jsMin())
		.pipe(gulp.dest('./target/js/'));
});

gulp.task('markdown', ['config', 'css', 'script'], function () {
	var latest = util.getNewestFile("source", ".md");
	opt.lastModify = latest.LatestTime;

	return gulp.src(sourcePath.md)
		.pipe(covertTo("template", opt.theme))
		.pipe(util.jade({
			basedir: path.resolve('./'),
			locals: opt,
			pretty: true
		}))
		.pipe(gulp.dest('./target/html/'))
		.pipe(connect.reload());
});

gulp.task('watch', function () {
	gulp.watch(sourcePath.css, ['css', 'markdown']);
	gulp.watch(sourcePath.script, ['script', 'markdown']);
	gulp.watch(sourcePath.md, ['markdown']);
});

gulp.task('connect', function() {
	connect.server({
		root: 'target/html/',
		livereload: true,
		port: 8080
	});
	util.openURL('http://localhost:8080/');
});

gulp.task('default', ['config', 'css', 'script', 'markdown', 'watch', 'connect']);