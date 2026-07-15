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
import {getRenderMode, getShowConsoleTab} from './store/settingsSlice';
import {useLocation} from 'wouter';
import {HIDConsole} from './components/panes/hid-console';
import styled from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *:focus {
    outline: none;
  }
`;

const PersistentPane = styled.div<{$active: boolean}>`
  display: ${({$active}) => ($active ? 'flex' : 'none')};
  flex: 1;
  min-height: 0;
`;

export default () => {
  const hasHIDSupport = 'hid' in navigator || OVERRIDE_HID_CHECK;

  const renderMode = useAppSelector(getRenderMode);
  const showConsoleTab = useAppSelector(getShowConsoleTab);
  const [location] = useLocation();
  const RouteComponents = useMemo(
    () =>
      PANES.filter((pane) => pane.key !== 'console').map((pane) => {
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
            {RouteComponents}
            {showConsoleTab && (
              <PersistentPane $active={location === '/console'}>
                <HIDConsole isActive={location === '/console'} />
              </PersistentPane>
            )}
          </Home>
        </TestContext.Provider>
    </>
  );
};
