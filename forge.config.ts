import { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerWix } from '@electron-forge/maker-wix'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { PublisherGitHubConfig } from '@electron-forge/publisher-github'
import { basename, extname, join, resolve, dirname } from 'path'
import { renameSync } from 'fs-extra'
import packageJSON from './package.json'

const gitHubConfig: PublisherGitHubConfig = {
    repository: {
        owner: 'reveal-editor',
        name: 'reveal-editor',
    },
    draft: false,
    prerelease: false,
}

const keepWindowsArtifact = (artifact: string) => {
    const filename = basename(artifact)
    const extension = extname(artifact)
    return filename !== 'RELEASES' && extension !== '.nupkg'
}

const renameArtifact = (artifact: string, newName: string) => {
    const resolvedPath = resolve(artifact)
    const fileDir = dirname(resolvedPath)
    const fileExtension = extname(resolvedPath)
    const newFilename = [newName, fileExtension].join('')
    const newPath = join(fileDir, newFilename)
    renameSync(resolvedPath, newPath)
    return newPath
}

const config: ForgeConfig = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({ noMsi: true }),
        new MakerWix({}),
        new MakerDMG({}),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
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
                if (result.platform === 'linux') {
                    // rename linux artifacts
                    result.artifacts = result.artifacts.map(artifact =>
                        renameArtifact(artifact, `${packageJSON.name}-${packageJSON.version}-linux-${result.arch}`)
                    )
                } else if (result.platform === 'darwin') {
                    // rename macos artifacts to avoid 27 character limit
                    result.artifacts = result.artifacts.map(artifact =>
                        renameArtifact(artifact, `${packageJSON.name}-${packageJSON.version}-macos-${result.arch}`)
                    )
                } else if (result.platform === 'win32') {
                    // filter out nupkg resources, as they cause duplicate naming conflicts
                    result.artifacts = result.artifacts.filter(keepWindowsArtifact)
                    // rename windows artifacts
                    result.artifacts = result.artifacts.map(artifact =>
                        renameArtifact(
                            artifact,
                            `${packageJSON.name}-${packageJSON.version}-windows-${result.arch}-setup`
                        )
                    )
                }
            })
            return results
        },
    },
}

export default config
