const download = require('./index')

download({
    dir: './.cache',
    dependencies: [
        {dependency: 'jquery', version: '3.7.1', alias: 'jquery'},
        {dependency: 'vue', version: '3.4.10'}
    ],
    retry: 5
})