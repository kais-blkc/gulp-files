let project_folder = require('path').basename(__dirname);
let source_folder = '#src';
let fs = require('fs');

// Пути к файлам
let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		fonts: project_folder + '/fonts/',
	},
	src: {
		pug: source_folder + '/pug/*.pug',
		scss: source_folder + '/scss/style.scss',
		js: source_folder + '/js/index.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: source_folder + '/fonts/*.ttf',
	},
	watch: {
		pug: source_folder + '/pug/**/*.pug',
		scss: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
	},
	clean: './' + project_folder + '/'
}

// VARIABLES
let {src, dest } = require('gulp'),
		gulp = require('gulp'),
		browsersync = require('browser-sync').create(),
		pug = require('gulp-pug'),
		del = require('del'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		autoprefixer = require('gulp-autoprefixer'),
		group_media = require('gulp-group-css-media-queries'),
		clean_css = require('gulp-clean-css'),
		rename = require('gulp-rename'),
		fileinclude = require('gulp-file-include'),
		uglify = require('gulp-uglify-es').default,
		babel = require('gulp-babel'),
		ttf2woff = require('gulp-ttf2woff'),
		ttf2woff2 = require('gulp-ttf2woff2'),
		fonter = require('gulp-fonter');


// FUNCTIONS
function browserSync() {
	browsersync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.pug)
	.pipe(pug({pretty: true}))
	.pipe(dest(path.build.html))
	.pipe(browsersync.stream())
}

function scss() {
	return src(path.src.scss)
	.pipe(sourcemaps.init())
	.pipe(sass({ outputStyle: "expanded" }))
	.pipe(group_media())
	.pipe(autoprefixer({
		overrideBrowserslist: ["last 3 version"],
		cascade: true
	}))
	.pipe(sourcemaps.write())
	.pipe(dest(path.build.css))
	.pipe(clean_css())
	.pipe(rename({ extname: ".min.css" }))
	.pipe(sourcemaps.write())
	.pipe(dest(path.build.css))
	.pipe(browsersync.stream())
}

function js() {
	return src(path.src.js)
	.pipe(fileinclude())
	.pipe(babel({
		presets: ['@babel/env']
	 }))
	.pipe(dest(path.build.js))
	.pipe(uglify())
	.pipe(rename({ extname: ".min.js" }))
	.pipe(dest(path.build.js))
	.pipe(browsersync.stream())
}

function img() {
	return src(path.src.img)
	.pipe(dest(path.build.img))
	.pipe(browsersync.stream())
}

function fonts() {
	src(path.src.fonts)
	.pipe(ttf2woff())
	.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
	.pipe(ttf2woff2())
	.pipe(dest(path.build.fonts))
}

// Для otf формата
gulp.task('otf2ttf', function() {
	return src([source_folder + '/fonts/*.otf'])
	.pipe(fonter({ formats: ['ttf'] }))
	.pipe(dest(source_folder + '/fonts/'))
});

// Автоматическое подключение шрифтов
function fontStyle() {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function(err, items) {
			if (items) {
				let c_fontname;
				for (let i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', `\n @include font(${fontname}, ${fontname}, 400, normal);`, (err) => {
							if (err) throw err;
							console.log('err')
						});
					}
						c_fontname = fontname;
				}
			}
		})
	}
}
// Нужно для корректной работы предыдущей функции
function cb() {}

function clean() {
	return del(path.clean);
}

function watchFiles() {
	gulp.watch([path.watch.pug], html);
	gulp.watch([path.watch.scss], scss);
	gulp.watch([path.watch.js], js);
}


let build = gulp.series(clean, gulp.parallel(html, scss, js, fonts), fontStyle);
let watch = gulp.parallel(browserSync, build, watchFiles);
// EXPPORTS
exports.fontStyle = fontStyle;
exports.fonts = fonts;
exports.js = js;
exports.scss = scss;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.watchFiles = watchFiles;
exports.default = watch;










