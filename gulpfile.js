/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var gulp = require('gulp');
var tsb = require('gulp-tsb');
var merge = require('merge-stream');
var path = require('path');
var rimraf = require('rimraf');

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
