import { ForgeConfig, ForgePackagerOptions } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerWix } from '@electron-forge/maker-wix'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { PublisherGitHubConfig } from '@electron-forge/publisher-github'
import { basename, extname, join, resolve, dirname } from 'path'
import { renameSync } from 'fs-extra'
import packageJSON from './package.json'

const gitHubConfig: PublisherGitHubConfig = {
    repository: {
        owner: 'moonslide-app',
        name: 'moonslide',
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

const normalizeWindowsVersion = (version: string) => {
    if (version.includes('-')) return version.replace(/-.*/, '')
    return version
}

const macOSPackagerConfig = (): ForgePackagerOptions => {
    if (process.platform !== 'darwin') return {}

    const packagerOptions: ForgePackagerOptions = {}

    // electron-packager currently does not use name and executableName correctly,
    // thus set executableName manually to package.json's productName
    packagerOptions.executableName = packageJSON.productName

    if (!process.env.CI) return packagerOptions

    if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD || !process.env.APPLE_TEAM_ID) {
        console.warn(
            'Should be notarizing, but environment variables APPLE_ID, APPLE_ID_PASSWORD or APPLE_TEAM_ID are missing!'
        )
        return packagerOptions
    }

    packagerOptions.osxSign = {
        identity: process.env.MACOS_CERT_IDENTITY,
    }

    packagerOptions.osxNotarize = {
        tool: 'notarytool',
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
    }

    return packagerOptions
}

const linuxPackagerConfig = (): ForgePackagerOptions => {
    if (process.platform !== 'linux') return {}

    return {
        extraResource: ['./assets/icon.png'],
    }
}

const config: ForgeConfig = {
    packagerConfig: {
        appBundleId: 'app.moonslide.desktop',
        name: packageJSON.productName,
        executableName: packageJSON.name,
        icon: './assets/icon',
        ...linuxPackagerConfig(),
        ...macOSPackagerConfig(),
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({
            noMsi: true,
            name: packageJSON.name,
            setupIcon: './assets/icon.ico',
            iconUrl:
                'https://media.githubusercontent.com/media/moonslide-app/moonslide/feature/fix-caching/assets/icon.ico',
        }),
        new MakerWix({
            name: packageJSON.productName,
            shortName: packageJSON.name,
            version: normalizeWindowsVersion(packageJSON.version),
            icon: './assets/icon.ico',
        }),
        new MakerDMG({
            icon: './assets/icon.icns',
        }),
        new MakerZIP({}, ['darwin']),
        new MakerRpm({
            options: {
                name: packageJSON.name,
                bin: packageJSON.name,
                productName: packageJSON.productName,
                icon: './assets/icon.png',
            },
        }),
        new MakerDeb({
            options: {
                name: packageJSON.name,
                bin: packageJSON.name,
                productName: packageJSON.productName,
                icon: './assets/icon.png',
            },
        }),
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
