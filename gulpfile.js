/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var bump = require('gulp-bump');
var merge = require('merge-stream');
var path = require('path');
var rimraf = require('rimraf');
var fs = require('fs');
var spawn = require('child_process').spawn;

const USE_PY_LAUNCHER = false;

function spawnPython(args, opts) {
	var cmd = 'python';
	if (USE_PY_LAUNCHER) {
		cmd = 'py';
		args.unshift('-2');
	}
	return spawn(cmd, args, opts);
}

// Default task
gulp.task("default", ["python-build-core"]);

gulp.task("python-build-core", function (cb) {
	console.info('Starting python build');
	var python = spawnPython(['build.py', 'core'], { stdio: 'inherit' });
	python.on('close', function (code) {
		console.log('python exited with code ' + code);
		cb(code);
	});
});

gulp.task("python-build", function (cb) {
	console.info('Starting python build');
	var python = spawnPython(['build.py', 'core'], { stdio: 'inherit' });
	python.on('close', function (code) {
		console.log('python exited with code ' + code);
		cb(code);
	});
});

gulp.task("python-build-all", function (cb) {
	console.info('Starting python build all');
	var python = spawnPython(['build.py'], { stdio: 'inherit' });
	python.on('close', function (code) {
		console.log('python exited with code ' + code);
		cb(code);
	});
});

function pxtPublishTask() {
	if (fs.existsSync('../pxt')) {
		pxtPublishTsTask();
		gulp.src('./blocks_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./blockly_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./msg/js/en.js').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/js/'));
		gulp.src('./msg/json/en.json').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/json/'));
		gulp.src('./media/').pipe(gulp.dest('../pxt/webapp/public/blockly/media/'));
	}
}

function pxtPublishTsTask() {
	if (fs.existsSync('../pxt')) {
		gulp.src('./typings/blockly.d.ts').pipe(gulp.dest('../pxt/localtypings/'));
	}
}

gulp.task('build', ['python-build-core'], function (cb) {
	cb(0);
});

gulp.task('publish', ['python-build-core'], pxtPublishTask);

gulp.task('publishall', ['python-build-all'], pxtPublishTask);

gulp.task('publishts', [], pxtPublishTsTask);

gulp.task('release', ['python-build-all'], function (done) {
	spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('bump', function () {
	gulp.src('./package.json')
		.pipe(bump({ key: "version" }))
		.pipe(gulp.dest('./'));
});
