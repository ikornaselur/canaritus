/* eslint-disable */

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var webpack = require('gulp-webpack');

gulp.task('default', ['copy', 'webpack']);

gulp.task('webpack', function () {
  gulp.src('src/client/**/*.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist'));

  gulp.src('src/worker/service-worker.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('service-worker.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
  gulp.src('src/images/*.png')
    .pipe(gulp.dest('dist/images'));
  gulp.src('src/worker/register-worker.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['default'], function () {
  watch('src/**/*.*', function () {
    gulp.start('default');
  });
});
