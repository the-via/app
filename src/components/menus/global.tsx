import * as React from 'react';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {RootState} from '../../redux';
import PANES from '../../utils/pane-config';
import {connect} from 'react-redux';

const Container = styled.div`
  width: 100vw;
  height: 25px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color_dark-grey);
  background-color: var(--color_light-jet);
  text-align: center;
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  font-family: inherit;
  outline: none;
  padding: 0;

  margin: 0 15px;
  font-size: 18px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${props =>
    props.selected ? 'var(--color_light-grey)' : 'var(--color_medium-grey)'};
  &:hover {
    color: ${props =>
      props.selected ? 'var(--color_light-grey)' : 'var(--color_light-grey)'};
  }
`;

const {DEBUG_PROD, NODE_ENV} = process.env;
const showDebugPane = NODE_ENV === 'development' || DEBUG_PROD === 'true';

const mapStateToProps = ({settings}: RootState) => ({
  showDesignTab: settings.showDesignTab
});

export function UnconnectedGlobalMenu(props) {
  const location = useLocation();

  const Panes = React.useMemo(() => {
    return PANES.map(pane => {
      if (pane.key === 'design' && !props.showDesignTab) return null;
      if (pane.key === 'debug' && !showDebugPane) return null;
      return (
        <Link key={pane.key} to={pane.path}>
          <MenuItem selected={pane.path === location.pathname}>
            {pane.title}
          </MenuItem>
        </Link>
      );
    });
  }, [location, props.showDesignTab]);

  return (
    <React.Fragment>
      <Container>{Panes}</Container>
    </React.Fragment>
  );
}

export default connect(mapStateToProps)(UnconnectedGlobalMenu);
