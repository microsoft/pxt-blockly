/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script for PXT testing and publishing
 */

var gulp = require('gulp');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.sourcemaps = require('gulp-sourcemaps');

var fs = require('fs');
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
const pxtBump = gulp.series([
  // Sync to latest
  function (done) {
    gulp.git.checkout('develop');
    gulp.git.pull('origin',' develop');
    done();
  },
  // Build compressed files and typings
  buildTasks.core,
  typings.typings,
  // Increment version, tag and push
  function (done) {
    var v = semver.inc(JSON.parse(fs.readFileSync('./package.json', 'utf8')).version, 'patch');
    gulp.src('./package.json')
      .pipe(gulp.bump({ "version": v }))
      .pipe(gulp.dest('./'));

    gulp.src('.')
      .pipe(gulp.git.add())
      .pipe(gulp.git.commit(v))
      .on('end', function () {
        gulp.git.tag('v' + v, v, function (error) {
          if (error) {
            return done(error);
          }
          gulp.git.push('origin', '', { args: '--tags' }, done);
        })
      });
  }]
);

module.exports = {
  pxttest: pxtTest,
  pxtbump: pxtBump
}
