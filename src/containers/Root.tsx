import * as React from 'react';
import type {Store} from 'redux';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import type {History} from 'history';
import Routes from '../Routes';

type Props = {
  store: Store;
  history: History;
};

export default ({store, history}: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </Provider>
);
