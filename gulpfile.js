var gulp = require('gulp'),
  less = require('gulp-less'),
  // 当编译less时出现语法错误或者其他异常，会终止watch事件，通常需要查看命令提示符窗口才能知道，这并不是我们所希望的，所以我们需要处理出现异常并不终止watch事件（gulp-plumber），并提示我们出现了错误（gulp-notify）。
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  // 调用多模块（编译less后压缩css）
  cssmin = require('gulp-minify-css'),
  // 当less有各种引入关系时，编译后不容易找到对应less文件，所以需要生成sourcemap文件，方便修改
  sourcemaps = require('gulp-sourcemaps'),
  // 合并文件
  concat = require('gulp-concat'),
  // 重命名文件
  rename = require('gulp-rename'),
  // 复制文件
  copy = require('gulp-copy'),
  through = require('through2'),
  // 移动指定文件，并且去掉源路径
  flatten = require('gulp-flatten'),
  // 压缩js
  uglify = require('gulp-uglify');



gulp.task('build', function() {
  // 编译src目录下的所有less文件
  // 除了a.less和d.less（**匹配src/less的0个或多个子文件夹）
  gulp.src(['src/less/*.less', 'src/less/**/*.less', '!src/less/**/{a,d}.less'])
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(less()) // 编译
    .pipe(concat('spa.css')) // 合并输出
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(sourcemaps.write())
    .pipe(cssmin()) // 压缩 ；兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
    .pipe(gulp.dest('dist/css'));
  // 编译合并压缩JS
  gulp.src(['src/js/spa.js', 'src/js/spa.{util,data,fake,model,util_b,shell}.js', 'src/js/**/*.js'])
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(concat('spa.js')) // 合并输出
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(sourcemaps.write())
    .pipe(uglify()) // 压缩js
    .pipe(gulp.dest('dist/js'));
  // 复制文件
  gulp.src([
      'node_modules/jquery/{jquery,jquery.min}.js',
      'node_modules/jquery.urianchor/jquery.uriAnchor.js',
      'node_modules/jquery.event.gevent/jquery.event.gevent.js',
      'node_modules/jquery.event.ue/jquery.event.ue.js',
      'node_modules/taffydb/{taffy,taffy-min}.js'
    ])
    .pipe(flatten())
    .pipe(gulp.dest('dist/lib'))
    .pipe(verify());
})

function verify() {
  var options = { objectMode: true };
  return through(options, write, end);

  function write(file, enc, cb) {
    console.log('file', file.path);
    cb(null, file);
  }

  function end(cb) {
    console.log('done');
    cb();
  }
}
// 若每修改一次less，就要手动执行任务，显然是不合理的，所以当有less文件发生改变时使其自动编译
gulp.task('Watch', function() {
  gulp.watch(['src/**/*.less', 'src/**/*.js'], ['build']); //当所有less文件发生改变时，调用testLess任务
});

gulp.task('default', ['Watch']);