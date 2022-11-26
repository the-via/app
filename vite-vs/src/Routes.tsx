import React from 'react';
import {UnconnectedGlobalMenu} from './components/menus/global';
import {HashRouter as Router, Switch, Route, Routes} from 'react-router-dom';
import PANES from './utils/pane-config';
import {Home} from './components/Home';
import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *:focus {
    outline: none;
  }
`;

export default () => {
  const hasHIDSupport = 'hid' in navigator;

  const RouteComponents = PANES.map((pane) => {
    return (
      <Route element={<pane.component />} key={pane.key} path={pane.path} />
    );
  });

  return (
    <Router>
      <GlobalStyle />
      {hasHIDSupport && <UnconnectedGlobalMenu />}
      <Home hasHIDSupport={hasHIDSupport}>
        <Routes>{RouteComponents}</Routes>
      </Home>
    </Router>
  );
};
