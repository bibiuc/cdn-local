let timestamp = Math.floor(new Date().getTime() / 1000);
const path = require('path');
const Axios = require('axios');
const fs = require('fs-extra');
const _config = {
    dir: '.cache'
};

const getVersion = async (axios, dependency, version) => {
    const {data} = await axios.get(dependency)
    version = version || 'latest'
    if (data) {
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
}

const getFiles = async (axios, dependency, version) => {
    const {data} = await axios.get(dependency + '@' + version)
    return data ? data.files || [] : [];
}

const saveFile = async (axios, dir, file, retry) => {
    let i = 0
    let err
    do {
        try {
            const filepath = path.join(dir, file.name)
            const {data} = await axios.get(file.name, {
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

const save = async (axios, dir, file, retry) => {
    const filepath = path.join(dir, file.name)
    if (file.type == 'directory') {
        if (!fs.existsSync(filepath)) {
            await fs.mkdir(filepath)
        }
        if (file.files) {
            await Promise.all(file.files.map((f) => {
                f.name = path.join(file.name, f.name)
                return save(axios, dir, f, retry)
            }))
        }
        return;
    }
    if (fs.existsSync(filepath)) {
        return
    }
    return saveFile(axios, dir, file, retry);
}

module.exports = async function(c) {
    const config = Object.assign({}, _config, c);
    const dir = path.resolve(config.dir)
    const apiAxios = Axios.create({
        baseURL: 'https://data.jsdelivr.com/v1/packages/npm/'
    })
    if (!fs.existsSync(dir)) {
        await fs.mkdir(dir)
    }
    return Promise.all(config.dependencies.map(async ({dependency, version, alias}) => {
        if (!alias) {
            alias = dependency
        }
        if (!version || version == 'latest') {
            version = await getVersion(apiAxios, dependency, version)
        }
        const files = await getFiles(apiAxios, dependency, version)
        const file = {
            type: 'directory',
            name: '',
            files
        }
        const cdnAxios = Axios.create({
            baseURL: `https://cdn.jsdelivr.net/npm/${dependency}@${version}`
        })
        return save(cdnAxios, path.join(dir, alias), file, config.retry)
    }));
}