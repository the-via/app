/** @type {import("snowpack").SnowpackUserConfig } */
import proxy from 'http2-proxy';

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
        resolveJSONModule: true,
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
    {
      src: '/definitions/.*',
      dest: (req, res) => {
        console.log(req.url);
        req.url = req.url.replace(/^\/definitions/, '');

        console.log(req.url);
        return proxy.web(req, res, {
          hostname: 'localhost',
          port: 5000,
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
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
