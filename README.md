# [VIA Web Application](https://usevia.app) - Your keyboards best friend

![android-chrome-192x192](https://user-images.githubusercontent.com/1714072/222621960-ddfb8ee6-a486-4c66-8852-b204ba7c807b.png)

[![Azure Static Web Apps CI/CD](https://github.com/the-via/app/actions/workflows/azure.yml/badge.svg)](https://github.com/the-via/app/actions/workflows/azure.yml)

VIA is a powerful, open-source web-based interface for configuring your [QMK](https://qmk.fm)-powered mechanical keyboard. It allows you to customize your keymaps, create macros, and adjust RGB settings (if it has RGB) on the fly, without needing to recompile your keyboard's firmware. This makes keyboard customization easier and more accessible for everyone.

## Looking for an offline app?

@cebby2420 has kindly made a desktop app that does so. This has no official affiliation with VIA, but you can find it at [https://github.com/cebby2420/via-desktop](https://github.com/cebby2420/via-desktop).

## Facing Issues?

If you encounter any issues or bugs while using the [VIA web application](https://usevia.app), please report them by opening an issue in the [Issues section](https://github.com/the-via/app/issues). This will help us to track down and resolve problems, and improve the VIA experience for everyone.

Before reporting, please make sure to check if an issue has already been reported. Thank you!

## Getting VIA to support your keyboard

Are you a keyboard maker or a developer interested in adding support for your keyboard? We welcome contributions to the VIA project!

1. The source code of the keyboard **has to be merged** in [QMK Firmware Repositories](https://github.com/qmk/qmk_firmware) Master branch.
2. Your `keymaps/via` keymap **has to be merged** in [VIA's QMK Userspace Repository](https://github.com/the-via/qmk_userspace_via) Main branch.
3. Create a definition in JSON format for your keyboard and submit it as a pull request to [VIA's Keyboards Repository](https://github.com/the-via/keyboards) Master branch.

Please follow our [Specification documentation](https://www.caniusevia.com/docs/specification) carefully to ensure your pull request is smoothly reviewed and merged.

## Local development setup

### Useful commands

#### `npm run start`

Runs the app in the development mode.
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds a static copy of your site to the `build/` folder.
Your app is ready to be deployed!

#### `npm run test`

Launches the application test runner.
Run with the `--watch` flag (`npm test -- --watch`) to run in interactive watch mode.

---

This project is tested with [BrowserStack](https://www.browserstack.com/).
