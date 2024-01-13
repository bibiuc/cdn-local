const download = require('./index')

download({
    dir: './.cache',
    dependencies: [
        {dependency: 'jquery', version: '3.7.1', alias: 'jquery', filter: download.filters.dist },
        // {dependency: 'vue', version: '3.4.10'}
        // {dependency: 'element-plus'}
    ],
    retry: 5
})