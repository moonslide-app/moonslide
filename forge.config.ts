import { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { PublisherGitHubConfig } from '@electron-forge/publisher-github'
import { resolve, extname, basename, dirname, join } from 'path'
import { renameSync } from 'fs-extra'

const gitHubConfig: PublisherGitHubConfig = {
    repository: {
        owner: 'reveal-editor',
        name: 'reveal-editor',
    },
}

const addSuffixToFilename = ({ filePath, suffix }: { filePath: string; suffix: string }) => {
    const resolvedPath = resolve(filePath)
    const fileDir = dirname(resolvedPath)
    const fileExtension = extname(resolvedPath)
    const originalBasename = basename(resolvedPath, fileExtension)
    const newFilename = [`${originalBasename}-${suffix}`, fileExtension].join('')
    const newPath = join(fileDir, newFilename)
    renameSync(resolvedPath, newPath)
    return newPath
}

const config: ForgeConfig = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [new MakerSquirrel({}), new MakerDMG({}), new MakerRpm({}), new MakerDeb({})],
    plugins: [
        new VitePlugin({
            // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
            // If you are familiar with Vite configuration, it will look really familiar.
            build: [
                {
                    // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                    entry: 'src-main/main.ts',
                    config: 'vite.main.config.ts',
                },
                {
                    entry: 'src/preload.ts',
                    config: 'vite.preload.config.ts',
                },
            ],
            renderer: [
                {
                    name: 'main_window',
                    config: 'vite.renderer.config.ts',
                },
            ],
        }),
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: gitHubConfig,
        },
    ],
    hooks: {
        postMake: async (_, results) => {
            results.forEach(result => {
                if (result.platform === 'win32') {
                    result.artifacts = result.artifacts.map(artifact => {
                        return addSuffixToFilename({
                            filePath: artifact,
                            suffix: `win32-${result.arch}`,
                        })
                    })
                }
            })
            return results
        },
    },
}

export default config
