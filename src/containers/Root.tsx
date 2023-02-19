import {Provider} from 'react-redux';

import {store} from '../store';
import Routes from '../Routes';

export default () => (
  <Provider store={store}>
    <Routes />
  </Provider>
);
