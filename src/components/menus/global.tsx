import React from 'react';
import styled from 'styled-components';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import cntl from 'cntl';
import PANES from '../../utils/pane-config';
import {useAppSelector} from 'src/store/hooks';
import {getShowDesignTab} from 'src/store/settingsSlice';

const containerClassName = cntl`
  border-b
  border-dark
  border-solid
  py-3
  text-center
  w-full
`;

const MenuItem = styled.button<{selected?: boolean}>`
  background: none;
  border: none;
  font-family: inherit;
  outline: none;
  padding: 0;

  margin: 0 15px;
  font-size: 18px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${(props) =>
    props.selected ? 'var(--color_light-grey)' : 'var(--color_medium-grey)'};
  &:hover {
    color: ${(props) =>
      props.selected ? 'var(--color_light-grey)' : 'var(--color_light-grey)'};
  }
`;

const {DEBUG_PROD, NODE_ENV} = import.meta.env;
const showDebugPane = NODE_ENV === 'development' || DEBUG_PROD === 'true';

export const UnconnectedGlobalMenu = () => {
  const showDesignTab = useAppSelector(getShowDesignTab);

  const location = useLocation();

  const Panes = React.useMemo(() => {
    return PANES.map((pane) => {
      if (pane.key === 'design' && !showDesignTab) return null;
      if (pane.key === 'debug' && !showDebugPane) return null;
      return (
        <Link key={pane.key} to={pane.path}>
          <MenuItem selected={pane.path === location.pathname}>
            {pane.title}
          </MenuItem>
        </Link>
      );
    });
  }, [location, showDesignTab]);

  return (
    <React.Fragment>
      <div className={containerClassName}>{Panes}</div>
    </React.Fragment>
  );
};
