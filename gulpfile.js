var Spawn      = require('child_process').spawn
var browserify = require('browserify')
var source     = require('vinyl-source-stream')
var gulp       = require('gulp')

gulp.task('browserify', function(){
  browserify('./browser.js').on('error', console.error)
  .bundle().on('error', console.error)
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('dist/'))
})

var serve
gulp.task('serve', function() {
  if (serve) serve.kill('SIGKILL')
  serve = Spawn('node', ['server.js'], {'stdio':'inherit'})
})

gulp.task('watch', ['serve', 'browserify'], function(){
  gulp.watch(['browser.js'], ['browserify'])
  gulp.watch(['server.js', 'lib/**/*.js'], ['serve'])
})
