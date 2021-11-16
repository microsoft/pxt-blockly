/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script for PXT testing and publishing
 */

var gulp = require('gulp');
gulp.bump = require('gulp-bump');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.sourcemaps = require('gulp-sourcemaps');

var fs = require('fs');
var semver = require('semver');
var execSync = require('child_process').execSync;

var typings = require('./typings');
var buildTasks = require('./build_tasks');

////////////////////////////////////////////////////////////
//                        PXT                             //
////////////////////////////////////////////////////////////

function pxtPublishTask() {
	if (fs.existsSync('../pxt')) {
		pxtPublishTsTask();
		gulp.src('./blocks_compressed.js').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/'), {overwrite: true});
		gulp.src('./blockly_compressed.js').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/'), {overwrite: true});
		gulp.src('./msg/js/en.js').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/msg/js/'), {overwrite: true});
		gulp.src('./msg/json/en.json').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/msg/json/'), {overwrite: true});
		return gulp.src('./media/**/*').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/media/'), {overwrite: true});
	}
}

function pxtPublishTsTask() {
	if (fs.existsSync('../pxt')) {
		return gulp.src('./typings/blockly.d.ts').pipe(gulp.dest('../pxt/node_modules/pxt-blockly/typings/'));
	}
}

// Task for building pxt-blockly, and copying files over to pxt
const pxtTest = gulp.series([buildTasks.core, pxtPublishTask]);

// Task for bumping patch version and tagging commit. Travis will upload to npm.
const pxtBump = gulp.series(
  // Sync to latest
  // execSync('git checkout develop', { stdio: 'inherit' }),
  // execSync('git pull origin develop', { stdio: 'inherit' }),
  // Build compressed files and typings
  buildTasks.core,
  typings.typings,
  function (done) {
    var v = semver.inc(JSON.parse(fs.readFileSync('./package.json', 'utf8')).version, 'patch');
    gulp.src('./package.json')
      .pipe(gulp.bump({ "version": v }))
      .pipe(gulp.dest('./'))
      .on('end', function () {
        execSync('git add blockly_compressed.js blocks_compressed.js typings/blockly.d.ts package.json', { stdio: 'inherit' });
        execSync('git commit -m "' + v + '"', { stdio: 'inherit' });
        execSync('git tag v' + v, { stdio: 'inherit' });
        execSync('git push origin v' + v, { stdio: 'inherit' });
        done();
      });
  }
)

module.exports = {
  pxttest: pxtTest,
  pxtbump: pxtBump
}
