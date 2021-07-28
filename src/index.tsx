import '@webscopeio/react-textarea-autocomplete/style.css';
import 'rc-slider/assets/index.css';
import * as React from 'react';
import {render} from 'react-dom';
import Root from './containers/Root';
import {configureStore, history} from './redux/configureStore';

const store = configureStore();

render(
  <Root store={store} history={history} />,
  document.getElementById('root'),
);
