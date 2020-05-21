let project_folder = require('path').basename(__dirname);
let source_folder = './#src';

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {
    html: source_folder + "/",
    pug: source_folder + "/pug/index.pug",
    css: source_folder: + "/css/main.css"
    scss: source_folder + "/scss/main.scss",
    js: source_folder + "/js/main.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf"
  },
  watch: {
    html: source_folder + "**/*.html",
    pug: source_folder + "/**/*.pug",
    scss: source_folder + "/scss/**/*.scss",
    css: source_folder + "/css/**/*.css",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
  },
  clean: "./" + project_folder + "/"
}

let gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  del = require('del'),
  scss = require('gulp-sass'),
  pug = require('gulp-pug'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  rename = require('gulp-rename'),
  clean_css = require('gulp-clean-css'),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify-es').default,
  fileinclude = require('gulp-file-include'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter');


// Tasks
gulp.task('server', function() {
    browserSync.init({
      server: {baseDir: "./" + project_folder + "/"},
      port: 3000,
      notify: false
    })

    gulp.watch([path.watch.pug], gulp.series('pug'));
    gulp.watch([path.watch.scss], gulp.series('scss'));
    gulp.watch([path.watch.js], gulp.series('js'));
});

gulp.task('html', function() {
    return gulp.src(path.src.html)
      .pipe(plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'HTML',
            message: err.message
          }
        })
      }))
      .pipe(gulp.dest(path.build.html))
      .pipe(browserSync.stream());
});

gulp.task('pug', function() {
    return gulp.src(path.src.pug)
      .pipe(plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: 'Pug',
            message: err.message
          }
        })
      }))
      .pipe(pug({
        pretty: true
      }))
      .pipe(gulp.dest(path.build.html))
      .pipe(browserSync.stream());
});

gulp.task('css', function() {
    return gulp.src(path.src.css)
      .pipe(plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'scss',
              message: err.message
            }
          })
        }))
      .pipe(sourcemaps.init())
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      }))
      .pipe(gulp.dest(path.build.css))
      .pipe(clean_css())
      .pipe(rename({
        extname: ".min.css"
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.build.css))
      .pipe(browserSync.stream());
});

gulp.task('scss', function() {
    return gulp.src(path.src.scss)
      .pipe(plumber({
          errorHandler: notify.onError(function(err) {
            return {
              title: 'scss',
              message: err.message
            }
          })
        }))
      .pipe(sourcemaps.init())
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      }))
      .pipe(scss({
        outputStyle: "expanded"
      }))
      .pipe(gulp.dest(path.build.css))
      .pipe(clean_css())
      .pipe(rename({
        extname: ".min.css"
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.build.css))
      .pipe(browserSync.stream());
});

gulp.task('js', function() {
    return gulp.src(path.src.js)
      .pipe(sourcemaps.init())
      .pipe(fileinclude())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({
        extname: ".min.js"
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.build.js))
      .pipe(browserSync.stream());
});

gulp.task('img', function() {
    return gulp.src(path.src.img)
      .pipe(gulp.dest(path.build.img))
      .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  gulp.src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(gulp.dest(path.build.fonts));
  return gulp.src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.build.fonts));
});


gulp.task('clean', function() {
    return del(path.clean);
});

gulp.task('myClean', function() {
    return del(path.build.css);
      del(path.build.html + "index.html");
});

gulp.task('ci', function() {
    return del(path.build.img);
});

gulp.task('first-build', gulp.series('clean', gulp.parallel('pug', 'scss', 'js', 'img', 'fonts')));
// Использовать при первом запуске
gulp.task('build', gulp.series('myClean', gulp.parallel('pug', 'scss', 'js'), 'server'));
// Использовать при втором запуске
gulp.task('default', gulp.series('first-build', 'server'));
// Функия по умолчанию