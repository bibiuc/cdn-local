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
        {dependency: 'jquery', version: '3.7.1', alias: 'jquery', filter: download.filters.dist},
        {dependency: 'vue', version: '3.4.10'},
        {dependency: 'element-plus'}
    ],
    retry: 5
}, download.cdns.jsdelivr())
```


### 参数介绍

``` typescript

class File {
    type: 'file' | 'directory', 
    name: string, // 这里会拼接上级路径 
    files: File[]
    ... // 其他的暂时没用到
}

type Filter = (file: File) => boolean 
type GetVersion = (dependency: string, version?: string) => Promise<string>
type GetFiles = (dependency: string, version: string) => Promise<File[]>
type SaveFile = (dir: string, file: File, retry: number) => Promise<any>


interface CDN {
    getVersion： GetVersion
    getFiles: GetFiles
    getSaveFile: GetSaveFile
}

class Dependency {
    dependency: string // 库的名称
    version: string // 版本
    alias: string // 库的目标重命名
    filter: Filter // 返回true则下载 false则不下载
}

class Config {
    dir: string // 目标文件夹
    dependencies: Dependency[] // 下载的依赖
    retry: number // 重试次数
}

download(config: Config, cdn: CDN = download.cdns.jsdelivr())
download.filters: Filter[]
download.filters.dist // 只下载dist文件夹的文件
download.cdns: Record<string, DefineCdn>
download.cdns.jsdeliver // jsdelivr下载 参数是 sdkRoot = 'https://data.jsdelivr.com/v1/packages/npm/', cdnRoot = 'https://cdn.jsdelivr.net/npm/'

```