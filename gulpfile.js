var gulp   = require('gulp');
var gutil  = require('gulp-util');
var bower  = require('bower');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var sass   = require('gulp-sass');
var minCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh     = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: [
    './public/lib/underscore/underscore.js',
    './public/lib/socket.io-client/socket.io.js',
    './public/lib/angular/angular.js',
    './public/lib/angular-socket-io/socket.js',
    './public/lib/angular-ui-router/release/angular-ui-router.js',
    './public/lib/nsPopover/src/nsPopover.js',
    './public/app/app.js',
    './public/app/**/*js'
  ],
  source: './public/app/**/*.js',
  build: './public/build/'
};

gulp.task('concat', function() {
  return gulp.src(paths.scripts)
    .pipe(concat('cmm.js'))
    .pipe(gulp.dest(paths.build))
    .pipe(notify({message: 'Build Done'}));
});

gulp.task('uglify',function() {
  return gulp.src(paths.build + 'cmm.js')
    .pipe(uglify())
    .pipe(concat('cmm.min.js'))
    .pipe(gulp.dest(paths.build))
    .pipe(notify({message: 'Build Done'}));
});

gulp.task('build', ['concat']);

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css/'))
    .pipe(minCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./public/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.source, ['build']);
  // gulp.watch(paths.sass, ['sass']);
});
