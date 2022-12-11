import {UnconnectedGlobalMenu} from './components/menus/global';
import {Route} from 'wouter';
import PANES from './utils/pane-config';
import {Home} from './components/Home';
import {createGlobalStyle} from 'styled-components';
import {CanvasRouter} from './components/three-fiber/canvas-router';
import {TestContext} from './components/panes/test';
import {useState} from 'react';

const GlobalStyle = createGlobalStyle`
  *:focus {
    outline: none;
  }
`;

export default () => {
  const hasHIDSupport = 'hid' in navigator;

  const RouteComponents = PANES.map((pane) => {
    return <Route component={pane.component} key={pane.key} path={pane.path} />;
  });

  const testContextState = useState({clearTestKeys: () => {}});
  return (
    <>
      <TestContext.Provider value={testContextState}>
        <GlobalStyle />
        {hasHIDSupport && <UnconnectedGlobalMenu />}
        <CanvasRouter />
        <Home hasHIDSupport={hasHIDSupport}>{RouteComponents}</Home>
      </TestContext.Provider>
    </>
  );
};
