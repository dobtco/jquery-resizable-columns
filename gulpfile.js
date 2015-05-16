var package = require('./package.json');
var gulp = require("gulp");
var gutil = require("gulp-util");
var babel = require("gulp-babel");
var babelify = require("babelify");
var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require("gulp-header");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var less = require("gulp-less");

const BANNER = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @date <%= new Date() %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
''].join('\n');

const BROWSERIFY_OPTIONS = {
	debug: true
};
const UGLIFY_OPTIONS = {
	preserveComments: 'some'
};
const LESS_OPTIONS = {};

// JS Compilation
gulp.task("build", function() {
	// Bundle using Browserify + Babel transform
	return browserify(BROWSERIFY_OPTIONS)
		.transform(babelify)
		.require('src/index.js', { entry: true})
		.bundle()
		.on("error", function (err) {
			console.log("Error : " + err.message);
		})

		// Compiled file + sourcemaps
		.pipe(source('jquery.resizableColumns.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write())
		.pipe(header(BANNER, { pkg: package }))
		.pipe(gulp.dest('dist/'))

		// Minified file + sourcemaps
		.pipe(uglify(UGLIFY_OPTIONS))
		.pipe(rename(function(path) {
			path.extname = '.min' + path.extname;
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist'))
});

// LESS compilation
gulp.task("less", function() {
	return gulp.src("less/index.less")
		.pipe(less(LESS_OPTIONS))
		.pipe(rename(function(path) {
			path.basename = 'jquery.resizableColumns';
		}))
		.pipe(gulp.dest("dist"));
});

// Watch tasks
gulp.task('build:watch', function() {
	gulp.watch('src/**/*.js', ['build']);
});
gulp.task('less:watch', function() {
	gulp.watch('less/**/*.less', ['less']);
});


// Aliases
gulp.task('watch', ['build:watch', 'less:watch']);
gulp.task('default', ['build', 'less']);