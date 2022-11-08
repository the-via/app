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
          return config;
        },
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
    {
      src: '/api/.*',
      dest: (req, res) => {
        // remove /api prefix (optional)
        return proxy.web(req, res, {
          hostname: 'localhost',
          port: 7071,
        });
      },
    },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: false,
    minify: false,
    splitting: true,

    target: 'es2018',
  },
  packageOptions: {
    knownEntrypoints: ['react-is'],
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
