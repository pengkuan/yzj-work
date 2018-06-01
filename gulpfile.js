const gulp = require('gulp')
const argv = require('yargs').argv
const fs = require('fs')
const clean = require('gulp-clean')
const zip = require('gulp-zip')

var host = {
    mywork_dev: 'http://192.168.22.144',
    // mywork_dev: 'http://dev.kdweibo.cn',
    mywork_devtest: 'http://devtest.kdweibo.cn',
    mywork_kdtest: 'https://dotest.kdweibo.cn',
    mywork_publish: 'https://www.yunzhijia.com'
}[argv.e] || 'https://www.yunzhijia.com'

var config = {
    appId: '10619',
    appIndex: host + '/mywork/index.html',
    interceptPath: host + '/mywork/'
}

var dateTime = function () {
    var now = new Date()
    return now.getFullYear() + '_' +
    zeroize(now.getMonth() + 1) +
    zeroize(now.getDate()) + '_' +
    zeroize(now.getHours()) +
    zeroize(now.getMinutes())
}
console.log(dateTime())
function zeroize (s) {
    s = s + ''
    if (s.length === 1) s = '0' + s
    return s
}

gulp.task('clean', function () {
    return gulp.src(['dist/conf.txt'], {
        read: false
    }).pipe(clean())
})

gulp.task('timeline', function (cb) {
    var txt = 'export default \'' + dateTime() + '\'\n'
    fs.writeFile('src/config/build-date.js', txt, cb)
})

gulp.task('config', function (cb) {
    fs.writeFile('dist/conf.txt', JSON.stringify(config), cb)
})

gulp.task('zip', ['config'], function () {
    return gulp.src(['dist/**/*'], {
        base: 'dist'
    })
    .pipe(zip(argv.e + '.zip'))
    .pipe(gulp.dest('release'))
    .on('end', function () {
        // gulp.start('clean')
    })
})
