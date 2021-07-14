import * as React from 'react';
import {HashRouter as Router, Switch, Route} from 'react-router-dom';
import UnconnectedGlobalMenu from './components/menus/global';
import PANES from './utils/pane-config';
import HomePage from './containers/HomePage';

export default () => {
  const RouteComponents = PANES.map(pane => {
    return (
      <Route
        component={pane.component}
        exact={pane.key === 'default' ? true : false}
        key={pane.key}
        path={pane.path}
      />
    );
  });

  return (
    <Router>
      <UnconnectedGlobalMenu />
      <HomePage>
        <Switch>{RouteComponents}</Switch>
      </HomePage>
    </Router>
  );
};
