/* eslint-disable */

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');
var watch = require('gulp-watch');

gulp.task('default', ['copy', 'transpile-js']);

gulp.task('transpile-js', function () {
  gulp.src('src/client/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('build.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));

  gulp.src('src/worker/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('service-worker.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
  gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
  gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'));
  gulp.src('src/images/*.png')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('server', ['default'], function () {
  gulp.src('dist')
    .pipe(webserver({
      fallback: 'index.html',
      livereload: true,
      open: true,
    }));
});

gulp.task('watch', ['default'], function () {
  watch('src/**/*.*', function () {
    gulp.start('default');
  });
});
