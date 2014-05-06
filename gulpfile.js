var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

var paths = {
    sass: ['./scss/**/*.scss'],
    html: ['./app/**/*.html']
};

gulp.task('sass', function (done) {
    gulp.src('./scss/app.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('connect', function () {
    connect.server({
        root: 'www',
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src('./www/*.html')
        .pipe(connect.reload());
});

gulp.task('default', ['connect', 'watch']);

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['sass', 'connect', 'watch']);
