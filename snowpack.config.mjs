/** @type {import("snowpack").SnowpackUserConfig } */
import proxy from 'http2-proxy';
import path from 'path';

export default {
  alias: {
    src: './src',
  },
  mount: {
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: [
    'snowpack-plugin-json5',
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-postcss',
    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? {tsc: 'yarn pnpify tsc'} : {}),
        resolveJSONModule: true,
      },
    ],
    [
      '@snowpack/plugin-webpack',
      {
        extendConfig: (config) => {
          const cssModulesRule = config.module.rules.find(
            (rule) =>
              rule &&
              rule.use &&
              rule.use.find(
                (use) =>
                  use &&
                  use.loader &&
                  use.loader.includes('css-loader') &&
                  use.options &&
                  use.options.modules,
              ),
          );

          if (cssModulesRule) {
            cssModulesRule.use.unshift({
              loader: path.resolve('./scripts/css-modules-fix.js'),
            });
          }

          return config;
        },
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: false,
    minify: false,
    splitting: true,

    target: 'es2018',
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    tailwindConfig: './tailwind.config.js'
  },
  buildOptions: {
    /* ... */
  },
};
