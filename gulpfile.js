var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
    var bundler = watchify(browserify('./src/Binding.js', {debug: true}).transform(babel));

    bundler.bundle()
        .on('error', function (err) {
            console.error(err);
            this.emit('end');
        })
        .pipe(source('build.js'))
        .pipe(buffer())
        // .pipe(uglify())
        // .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['build']);
})

gulp.task('default', ['build', 'watch']);