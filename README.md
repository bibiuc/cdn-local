# Jsdelivr download
这是一个jsdelivr的下载工具，主要是希望开发测试的时候将jsdelivr的npm包下载下来使用，bower现在更新很慢，所以弄了这么个东西

## API
这只是一个下载方法。
### 安装

``` bash
npm install jsdelivr-download --save-dev
pnpm install jsdelivr-download --save-dev
yarn install jsdelivr-download --save-dev
```
### 使用
``` javascript
const download = require('./index')

download({
    dir: './.cache',
    dependencies: [
        {dependency: 'jquery', version: '3.7.1', alias: 'jquery'},
        {dependency: 'vue', version: '3.4.10'},
        {dependency: 'element-plus'}
    ],
    retry: 5
})
```


### 参数介绍

``` typescript
class Dependency {
    dependency: string // 库的名称
    version: string // 版本
    alias: string // 库的目标重命名
}

class Config {
    dir: string // 目标文件夹
    dependencies: Dependency[] // 下载的依赖
    retry: number // 重试次数
}

```