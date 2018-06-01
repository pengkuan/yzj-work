import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

Raven
.config('https://b6c7a875fed74bdf99c50dbd4d75de58@sentry.kdweibo.cn/7', {
    ignoreErrors: [
        'fb_xd_fragment'
    ],
    ignoreUrls: [
        /(http)?:\/\/localhost/
    ],
    includePaths: [
        /(http|https)?:\/\/(static\.|www\.)?yunzhijia\.com/,
        /(http|https)?:\/\/(static\.|www\.)?kdtest\.(com|cn)/
    ],
    // A sampling rate to apply to events. A value of 0.0 will send no events, and a value of 1.0 will send all events (default).
    sampleRate: 1,
    // By default, Raven.js attempts to suppress duplicate captured errors and messages that occur back-to-back.
    allowDuplicates: false,
    // If set to true, Raven.js outputs some light debugging information onto the console.
    debug: true
})
.addPlugin(RavenVue, Vue)
.install()
