import {ApplicationInsights} from '@microsoft/applicationinsights-web';
import * as Sentry from '@sentry/react';
import '@webscopeio/react-textarea-autocomplete/style.css';
import {createRoot} from 'react-dom/client';
import './app.global.css';
import Root from './containers/Root';
import {updateCSSVariables} from './utils/color-math';
import {
  getThemeModeFromStore,
  getThemeNameFromStore,
} from './utils/device-store';
import {THEMES} from './utils/themes';

const {MODE} = import.meta.env;

Sentry.init({
  dsn: 'https://1083464e2a864de791972ab8c976849a@o4504817817747456.ingest.sentry.io/4504817834655749',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  normalizeDepth: 10,
  environment: MODE,
});

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'b3c046b8-137c-47f3-b28d-9049abfa9fe8',
    /* ...Other Configuration Options... */
  },
});
appInsights.loadAppInsights();
appInsights.trackPageView(); // Manually call trackPageView to establish the current user/session/pageview
const elem = document.getElementById('root');
if (elem) {
  const root = createRoot(elem);
  root.render(<Root />);
  document.documentElement.dataset['themeMode'] = getThemeModeFromStore();
  updateCSSVariables(getThemeNameFromStore() as keyof typeof THEMES);
}
