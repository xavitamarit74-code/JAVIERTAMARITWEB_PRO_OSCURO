// ===================================
// DEPENDENCIES
// ===================================
const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sharp = require('sharp');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs').promises;

// ===================================
// TASKS
// ===================================

// CSS Task - Compile SCSS to CSS and minify
function css(done) {
  src("src/scss/app.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([
      autoprefixer(),
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifyGradients: true
        }]
      })
    ]))
    .pipe(dest("build/css"));

  done();
}

// JavaScript Task - Copy JS files to build
function js(done) {
  src("src/js/**/*.js", { encoding: false })
    .pipe(dest("build/js"));

  done();
}

// Fonts Task - Copy fonts to build
function fonts(done) {
  src("src/fonts/**/*", { encoding: false })
    .pipe(dest("build/fonts"));

  done();
}

// HTML Task - Copy all HTML files from root to build
function html(done) {
  src("*.html", { encoding: false })
    .pipe(dest("build"));

  done();
}

// Root Files Task - Copy robots.txt, sitemaps, and .htaccess to build
function rootFiles(done) {
  src(["robots.txt", "sitemap*.xml", ".htaccess"], { encoding: false, dot: true })
    .pipe(dest("build"));

  done();
}

// SEO Task - Copy seo folder to build
function seo(done) {
  src("src/seo/**/*", { encoding: false })
    .pipe(dest("build/seo"));

  done();
}

// Data Task - Copy data files to build
function data(done) {
  src("src/data/**/*", { encoding: false })
    .pipe(dest("build/data"));

  done();
}

// Images Task - Convert to WebP/AVIF and copy all files
async function images() {
    // Get only JPG/JPEG/PNG files for conversion
    const imageFiles = await glob('src/img/**/*.{png,jpg,jpeg}');

    // Convert to WebP using sharp
    for (const file of imageFiles) {
        try {
            const outputPath = file.replace('src/img/', 'build/img/').replace(/\.(png|jpe?g)$/i, '.webp');
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await sharp(file)
                .webp({ quality: 50 })
                .toFile(outputPath);
        } catch (err) {
            console.error('WebP conversion error for', file, ':', err.message);
        }
    }

    // Convert to AVIF using sharp
    for (const file of imageFiles) {
        try {
            const outputPath = file.replace('src/img/', 'build/img/').replace(/\.(png|jpe?g)$/i, '.avif');
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await sharp(file)
                .avif({ quality: 50 })
                .toFile(outputPath);
        } catch (err) {
            console.error('AVIF conversion error for', file, ':', err.message);
        }
    }

    // Copy ALL files from src/img to build/img (including SVG, ICO, etc.)
    await new Promise((resolve, reject) => {
        src('src/img/**/*', { encoding: false })
            .pipe(dest('build/img'))
            .on('end', resolve)
            .on('error', reject);
    });
}

// Favicon Task - Copy favicon files to build
function favicon(done) {
  src("src/favicon_io/**/*", { encoding: false })
    .pipe(dest("build/favicon_io"));

  done();
}

// Contents Task - Copy contents files to build
function contents(done) {
  src("src/contents/**/*", { encoding: false })
    .pipe(dest("build/contents"));

  done();
}

// Podcasts Task - Copy podcasts files to build
function podcasts(done) {
  src("src/podcasts/**/*", { encoding: false })
    .pipe(dest("build/podcasts"));

  done();
}

// Video Task - Copy video files to build
function video(done) {
  src("src/video/**/*", { encoding: false })
    .pipe(dest("build/video"));

  done();
}

// Dev Task - Watch for changes
function dev(done) {
  watch("src/scss/**/*.scss", css);
  watch("src/js/**/*.js", js);
  watch("src/fonts/**/*", fonts);
  watch("src/img/**/*", images);
  watch("src/favicon_io/**/*", favicon);
  watch("src/data/**/*", data);
  watch("src/contents/**/*", contents);
  watch("src/podcasts/**/*", podcasts);
  watch("src/video/**/*", video);
  watch("src/seo/**/*", seo);
  watch("*.html", html);
  watch(["robots.txt", "sitemap*.xml", ".htaccess"], rootFiles);
  done();
}

// ===================================
// EXPORTS
// ===================================
exports.css = css;
exports.js = js;
exports.fonts = fonts;
exports.images = images;
exports.favicon = favicon;
exports.data = data;
exports.contents = contents;
exports.podcasts = podcasts;
exports.video = video;
exports.html = html;
exports.rootFiles = rootFiles;
exports.seo = seo;
exports.dev = dev;
exports.default = series(css, js, fonts, images, favicon, data, contents, podcasts, video, html, rootFiles, seo, dev);
