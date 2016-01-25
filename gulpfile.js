var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var ngAnnotate = require('gulp-ng-annotate');

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');
// Test directory for test files
var testDirectory = path.join(rootDirectory, './test');

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js'),

];

var testFiles = [
  // All unit test files
  path.join(testDirectory, '/unit/**/*.spec.js'),

  path.join(testDirectory, '/e2e/**/*.spec.js')
];

var allFiles = sourceFiles + testFiles;

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma.conf.js'
].concat(allFiles);

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(ngAnnotate())
    .pipe(concat('azavea-ng-leaflet.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('azavea-ng-leaflet.min.js'))
    .pipe(gulp.dest('./dist'));
});

/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence('jshint', 'test', 'build', done);
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(allFiles, ['process-all']);
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('default', function () {
  runSequence('process-all', 'watch');
});
