export function formatDate (date, pattern) {
    let _padding = (s, len) => {
        let l = len - (s + '').length
        for (var i = 0; i < l; i++) { s = '0' + s }
        return s
    }
    const SIGN_REGEXP = /([yMdhsm])(\1*)/g
    const DEFAULT_PATTERN = 'yyyy-MM-dd'
    // if (typeof(date) === 'string') {
    //     date = new Date(date)
    // }
    pattern = pattern || DEFAULT_PATTERN
    return pattern.replace(SIGN_REGEXP, function ($0) {
        switch ($0.charAt(0)) {
            case 'y':
                return _padding(date.getFullYear(), $0.length)
            case 'M':
                return _padding(date.getMonth() + 1, $0.length)
            case 'd':
                return _padding(date.getDate(), $0.length)
            case 'w':
                return date.getDay() + 1
            case 'h':
                return _padding(date.getHours(), $0.length)
            case 'm':
                return _padding(date.getMinutes(), $0.length)
            case 's':
                return _padding(date.getSeconds(), $0.length)
        }
    })
}
