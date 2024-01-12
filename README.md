# cdn-local
这是一个cdn的下载工具，主要是希望开发测试的时候将cdn的npm包下下来使用，bower现在更新很慢，所以弄了这么个东西，现在暂时只有jsdelivr

## API
这只是一个下载方法。
### 安装

``` bash
npm install @pitue/cdn-local --save-dev
pnpm install @pitue/cdn-local --save-dev
yarn install @pitue/cdn-local --save-dev
```
### 使用
``` javascript
const download = require('@pitue/cdn-local')

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