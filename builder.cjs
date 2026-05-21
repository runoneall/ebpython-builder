;(async () => {
    const { Readable } = require('stream')
    const fs = require('fs')
    const { pipeline } = require('stream/promises')
    const { randomUUID } = require('crypto')
    const { join } = require('path')
    const { spawnSync } = require('child_process')

    const download = async (url, saveto) => {
        console.log('fetch', url)
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`failed to fetch ${url}: ${resp.statusText}`)

        const webstream = resp.body
        const nodestream = Readable.fromWeb(webstream)

        const filestream = fs.createWriteStream(saveto)
        await pipeline(nodestream, filestream)
    }

    const ebpython_os_arch = process.env.CUSTOM_EBPYTHON_OS_ARCH
    const ebpython_bin = `ebpython-${ebpython_os_arch}` + (ebpython_os_arch.includes('windows') ? '.exe' : '')

    const ebpython_version = process.env.CUSTOM_EBPYTHON_VERSION
    const download_url = 'https://github.com/runoneall/ebpython/releases/' + (ebpython_version === 'latest' ? 'latest/download/' : `download/${ebpython_version}/`)

    await download(download_url + ebpython_bin, ebpython_bin)

    const output_dir = randomUUID()
    fs.mkdirSync(output_dir)
    fs.writeFileSync('.ebpython-builder-dist-output-dir', output_dir)

    const config_dir = process.env.CONFIG_DIR
    const config_to_build = fs.readdirSync(config_dir)

    config_to_build.forEach(name => {
        console.log('build', name)

        const config_path = join(config_dir, name)
        const ebpython_config = JSON.parse(fs.readFileSync(config_path))

        if (process.platform !== 'win32') {
            fs.chmodSync(ebpython_bin, 0o755)
        }

        const result = spawnSync(ebpython_bin, [config_path], { stdio: 'inherit', shell: true })
        if (result.error) {
            console.error('build', name, 'failed')
            return
        }

        const distzipname = ebpython_config.launcher.name + '.zip'
        fs.copyFileSync(join(ebpython_config.output, distzipname), join(output_dir, distzipname))
    })
})()
