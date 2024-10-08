import '@webscopeio/react-textarea-autocomplete/style.css';
import {createRoot} from 'react-dom/client';
import Root from './containers/Root';
import {ApplicationInsights} from '@microsoft/applicationinsights-web';
import './app.global.css';
import {
  getThemeModeFromStore,
  getThemeNameFromStore,
} from './utils/device-store';
import {updateCSSVariables} from './utils/color-math';
import {THEMES} from './utils/themes';

const {MODE} = import.meta.env;

const elem = document.getElementById('root');
if (elem) {
  const root = createRoot(elem);
  root.render(<Root />);
  document.documentElement.dataset['themeMode'] = getThemeModeFromStore();
  updateCSSVariables(getThemeNameFromStore() as keyof typeof THEMES);
}
