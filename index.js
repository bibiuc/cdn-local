let timestamp = Math.floor(new Date().getTime() / 1000);
const path = require('path');
const Axios = require('axios');
const fs = require('fs-extra');
const _config = {
    dir: '.cache'
};

const save = async (saveFile, dir, file, retry, filter) => {
    const filepath = path.join(dir, file.name)
    if (file.name && typeof filter == 'function' && !filter(file)) {
        return
    }
    if (file.type == 'directory') {
        if (!fs.existsSync(filepath)) {
            await fs.mkdir(filepath)
        }
        if (file.files) {
            await Promise.all(file.files.map((f) => {
                f.name = path.join(file.name, f.name)
                return save(saveFile, dir, f, retry, filter)
            }))
        }
        return;
    }
    if (fs.existsSync(filepath)) {
        return
    }
    return saveFile(dir, file, retry);
}
const cdns = {
    jsdelivr: (sdkRoot = 'https://data.jsdelivr.com/v1/packages/npm/', cdnRoot = 'https://cdn.jsdelivr.net/npm/') => {
        const apiAxios = Axios.create({
            baseURL: sdkRoot
        })
        return {
            async getVersion(dependency, version) {
                const {data} = await apiAxios.get(dependency)
                version = version || 'latest'
                if (!data) {
                    throw new Error('Dependency Not Found')
                }
                if (data.tags && data.tags[version]) {
                    version = data.tags[version]
                }
                if (!data.versions) {
                    throw new Error('Dependency Version Not Found')
                }
                for (let i = 0; i < data.versions.length; i++) {
                    if (data.versions[i].version == version) {
                        return version
                    }        
                }
                throw new Error('Dependency Version Not Found')
            },
            async getFiles(dependency, version) {
                const {data} = await apiAxios.get(dependency + '@' + version)
                return data ? data.files || [] : [];
            },
            getSaveFile(dependency, version) {
                const cdnAxios = Axios.create({
                    baseURL: `${cdnRoot}${dependency}@${version}`
                })
                return async (dir, file, retry) => {
                    let i = 0
                    let err
                    do {
                        try {
                            const filepath = path.join(dir, file.name)
                            const {data} = await cdnAxios.get(file.name, {
                                responseType: 'arraybuffer',
                            })
                            const saved = await fs.writeFile(filepath, data)
                            return saved;
                        } catch(e) {
                            err = e
                        }
                    } while(i < retry)
                    throw err
                }
            }
        }
    }
}

module.exports = async function(c, cdn = cdns.jsdelivr()) {
    const config = Object.assign({}, _config, c);
    const dir = path.resolve(config.dir)
    if (!fs.existsSync(dir)) {
        await fs.mkdir(dir)
    }
    return Promise.all(config.dependencies.map(async ({dependency, version, alias, filter}) => {
        if (!alias) {
            alias = dependency
        }
        if (!version || version == 'latest') {
            version = await cdn.getVersion(dependency, version)
        }
        const files = await cdn.getFiles(dependency, version)
        const file = {
            type: 'directory',
            name: '',
            files
        }
        return save(cdn.getSaveFile(dependency, version), path.join(dir, alias), file, config.retry, filter)
    }));
}

module.exports.filters = {
    dist: (file) => file.name.startsWith('dist' + path.sep) || file.name == 'dist'
}
module.exports.cdns = cdns
