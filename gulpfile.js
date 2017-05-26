/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var tsb = require('gulp-tsb');
var bump = require('gulp-bump');
var merge = require('merge-stream');
var path = require('path');
var rimraf = require('rimraf');
var fs = require('fs');
var spawn = require('child_process').spawn;

var tsconfig = require(path.join(__dirname, 'ts', 'tsconfig.json'));

var compilation = tsb.create(Object.assign({ verbose: true }, tsconfig.compilerOptions));

function compileTask() {
	return merge(
		gulp.src('lib/*.js', { base: '.' }),
		gulp.src("ts/**/*.ts").pipe(compilation())
	)
	.pipe(gulp.dest('./core/'));
}

// Default task
gulp.task("default", ["compile"]);

gulp.task('clean-out', function(cb) { rimraf('out', { maxBusyTries: 1 }, cb); });
gulp.task('compile', ['clean-out'], compileTask);
gulp.task('compile-without-clean', compileTask);
gulp.task('watch', ['compile'], function() {
	gulp.watch('ts/**/*.ts', ['compile-without-clean']);
});

gulp.task("python-build", function(cb){
	console.info('Starting python build');
	var python = spawn('python', ['build.py'], {stdio: 'inherit'});
	python.on('close', function (code) {
		console.log('python exited with code ' + code);
		cb(code);
	});
});

function pxtPublishTask() {
	if (fs.existsSync('../pxt')) {
		gulp.src('./blocks_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./blockly_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./msg/js/en.js').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/js/'));
		gulp.src('./msg/json/en.json').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/json/'));
		gulp.src('./messages.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./media/').pipe(gulp.dest('../pxt/webapp/public/blockly/media/'));
	}
}

gulp.task('build', ['compile', 'python-build'], function (cb) {
	cb(0);	
});

gulp.task('publish', ['compile', 'python-build'], pxtPublishTask);

gulp.task('release', ['compile', 'python-build'], function (done) {
	spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('bump', function(){
  gulp.src('./package.json')
  .pipe(bump({key: "version"}))
  .pipe(gulp.dest('./'));
});
