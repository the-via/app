import {UnconnectedGlobalMenu} from './components/menus/global';
import {Route} from 'wouter';
import PANES from './utils/pane-config';
import {Home} from './components/Home';
import {createGlobalStyle} from 'styled-components';
import {CanvasRouter as CanvasRouter3D} from './components/three-fiber/canvas-router';
import {CanvasRouter as CanvasRouter2D} from './components/two-string/canvas-router';
import {TestContext} from './components/panes/test';
import {useMemo, useState} from 'react';
import {OVERRIDE_HID_CHECK} from './utils/override';
import {useAppSelector} from './store/hooks';
import {getRenderMode} from './store/settingsSlice';
import {Errors} from './components/panes/errors';

const GlobalStyle = createGlobalStyle`
  *:focus {
    outline: none;
  }
`;

export default () => {
  const hasHIDSupport = 'hid' in navigator || OVERRIDE_HID_CHECK;

  const renderMode = useAppSelector(getRenderMode);
  const RouteComponents = useMemo(
    () =>
      PANES.map((pane) => {
        return (
          <Route component={pane.component} key={pane.key} path={pane.path} />
        );
      }),
    [],
  );

  const CanvasRouter = renderMode === '2D' ? CanvasRouter2D : CanvasRouter3D;
  const testContextState = useState({clearTestKeys: () => {}});
  return (
    <>
      <TestContext.Provider value={testContextState}>
        <GlobalStyle />
        {hasHIDSupport && <UnconnectedGlobalMenu />}
        <CanvasRouter />
        <Home hasHIDSupport={hasHIDSupport}>
          <Route component={Errors} path={'/errors'} /> {RouteComponents}
        </Home>
      </TestContext.Provider>
    </>
  );
};
