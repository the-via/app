import {UnconnectedGlobalMenu} from './components/menus/global';
import {Route, useLocation} from 'wouter';
import PANES from './utils/pane-config';
import {Home} from './components/Home';
import {createGlobalStyle} from 'styled-components';
import {CanvasRouter} from './components/three-fiber/canvas-router';

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

  const [route] = useLocation();

  return (
    <>
      <GlobalStyle />
      {hasHIDSupport && <UnconnectedGlobalMenu />}
      <CanvasRouter />
      <Home hasHIDSupport={hasHIDSupport}>{RouteComponents}</Home>
    </>
  );
};
