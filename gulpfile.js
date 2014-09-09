'use strict';

var	gulp = require('gulp'),
	jade = require('gulp-jade'),
	markdown = require('gulp-markdown'),
	watch = require('gulp-watch'),
	concat = require('gulp-concat'),
	cssMin = require('gulp-minify-css'),
	jsMin = require('gulp-uglify'),
	connect = require('gulp-connect'),
	fs = require('fs'),
	path = require('path'),
	getLatesetMdByDir = require('./lib/util').getLatesetMdByDir,
	covertMD = require('./lib/covert').covertMD,
	highlight = require('highlight.js'),
	opt = null,
	sourcePath = null;

gulp.task('config', function () {
	var data = fs.readFileSync('./config.json', 'utf-8');
	opt = JSON.parse(data);
	sourcePath = {
		"css": 'theme/' + opt.theme + '/static/*.css',
		"script": 'theme/' + opt.theme + '/static/*.js',
		"template": 'theme/' + opt.theme + '/template/*.jade',
		"md": 'source/*.md'
	};
});

gulp.task('css', ['config'], function () {
	return gulp.src(sourcePath.css)
		.pipe(concat('page.css'))
		.pipe(cssMin())
		.pipe(gulp.dest('./target/css/'));
});

gulp.task('script', ['config'], function () {
	return gulp.src(sourcePath.script)
		.pipe(concat('page.js'))
		.pipe(jsMin())
		.pipe(gulp.dest('./target/js/'));
});

gulp.task('markdown', ['config', 'css', 'script'], function () {
	var latest = getLatesetMdByDir(path.dirname(sourcePath.md));
	opt.lastModify = latest.LatestTime;

	return gulp.src(sourcePath.md)
		.pipe(concat('page.md'))
		.pipe(markdown())
		.pipe(covertMD())
		.pipe(gulp.dest('theme/' + opt.theme + '/template'));
});

gulp.task('template', ['markdown'], function () {
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
	gulp.watch(sourcePath.md, ['markdown', 'template']);
});

gulp.task('connect', function() {
	connect.server({
		root: 'target/html/',
		livereload: true
	});
});

gulp.task('default', ['config', 'css', 'script', 'markdown', 'template', 'watch', 'connect']);