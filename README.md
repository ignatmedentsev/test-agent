# Agent

## General info

- Install dependencies in order to run or build the app - ```npm i```
- Build app
  - ```electron:linux``` - build for linux
  - ```electron:windows``` - build for windows
  - ```electron:windows:ci``` - build for windows for CI
  - ```electron:mac``` - build for Mac OS X

After a build the release appears in the 'releases' folder

### For automatic updates

- Check that the repo in package.json is configured correctly

### Defaults

- Platform address by default after build - ```https://api-prod.mdw.io```
- Platform address by default when launching in dev mode - ```https://localhost:3000```
- Default agent PACS host, port - ```localhost:9999```, AET - ``NANOX``

## Scripts

### Render process

- ```render:build``` - build angular app
- ```render:clear``` - delete ``dist/apps/render`` folder
- ```render:start``` - start angular server
- ```render:watch``` - build with watch option (not working with desktop:dev)

***

### Desktop application

- ```desktop:build``` - build desktop application
- ```desktop:clear``` - delete ``dist/apps/desktop-agent`` folder
- ```desktop:db:generate``` - generate migration for desktop agent
- ```desktop:db:migrate``` - run migration for desktop agent
- ```desktop:db:revert``` - revert migration for desktop agent
- ```desktop:start:dev``` - start watch mode Electron/NestJS app
- ```desktop:start``` - start desktop Electron/NestJS app with empty NODE_ENV and Electron load window from file

### Containerized application

- ```headless:build:docker``` - build docker image
- ```headless:build``` - build desktop application
- ```headless:clear``` - delete ``dist/apps/headless-agent`` folder
- ```headless:db:generate``` - generate migration for headless agent
- ```headless:db:migrate``` - run migration for headless agent
- ```headless:db:revert``` - revert migration for headless agent
- ```headless:pm2:start``` - start headless agent under pm2
- ```headless:start:dev``` - start watch mode NestJS app in watch mode
- ```headless:start``` - start desktop NestJS app

***

### Tools

- ```rm:release``` - rm -rf *release*
- ```desktop:copy:assets``` - copy assets to dist folder (*nix OS). It's necessary for dev mode for show icon in bar
- ```desktop:copy:assets:win``` - copy assets to dist folder (Windows only). It's necessary for dev mode for show icon in bar

- ```lint:all:ci``` - lint all for CI (style, main, render)
- ```lint:all:fix``` - fix lint all
- ```lint:all``` - lint all (style, main, render)
- ```lint:desktop:ci``` - lint desktop app for CI
- ```lint:desktop:fix``` - fix desktop app lint
- ```lint:desktop``` - lint desktop app
- ```lint:headless:ci``` - lint containerized app for CI
- ```lint:headless:fix``` - fix containerized app lint
- ```lint:headless``` - lint containerized app
- ```lint:libs:ci``` - lint libs for CI
- ```lint:libs``` - lint libs
- ```lint:render:fix``` - fix render lint
- ```lint:render``` - lint code render (eslint)
- ```lint:style:ci``` - lint styles for CI
- ```lint:style:fix``` - fix styles
- ```lint:style``` - lint styles

- ```asar:extract:linux``` - extract asar (linux) archive for debug
- ```asar:extract:win``` - extract asar (windows) archive for debug
- ```asar:extract:mac-arm64``` - extract asar (MAC arm64) archive for debug

***

#### Build

- ```electron:builder``` - alias run electron-builder
- ```electron:build:src``` - build all src (render and desktop) before release
- ```electron:linux``` - build for linux
- ```electron:windows``` - build for windows
- ```electron:mac``` - build for mac

To start the app run ```render:start``` after ```desktop:start:dev```

## Run

### Desktop

Agent starts on 3003 port.

Some things can be configured in the config.json file, it can be found in the following locations:

- Windows: ```AppData/Roaming/<app-folder>```
- Linux (Ubuntu): ```Home/.config/<app-folder>```
- MacOS: ```~Library/Application Support/<app-folder>```

### Containerized agent

Agent listens on port 3005 (HTTP), 3006 (HTTPS), 9999 (DICOM).

Config path is expected to be `/app/data/config.json`.
