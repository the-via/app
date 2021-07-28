/** @type {import("snowpack").SnowpackUserConfig } */
export default {
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
      },
    ],
    /*
    [
      '@snowpack/plugin-webpack',
      {
        extendConfig: (config) => {
          return {
            ...config,
            optimization: {
              concatenateModules: true,
              removeEmptyChunks: true,
              minimize: true,
              splitChunks: {chunks: 'all'},
            },
            module: {
              rules: [
                {test: /\.json$/, loader: 'json'},
                {test: /\.png$/, loader: 'url-loader'},
              ],
            },
          };
        },
      },
    ],
    */
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
