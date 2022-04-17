import React from 'react';
import styled from 'styled-components';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import cntl from 'cntl';
import PANES from '../../utils/pane-config';
import {useAppSelector} from 'src/store/hooks';
import {getShowDesignTab} from 'src/store/settingsSlice';
import MenuItem from './MenuItem';
import Logo from 'src/components/Logo';

const containerClassName = cntl`
  bg-secondary
  flex
  gap-12
  mx-auto
  min-w-0
  my-6
  p-3
  rounded-xl
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
          <MenuItem isSelected={pane.path === location.pathname}>
            {pane.title}
          </MenuItem>
        </Link>
      );
    });
  }, [location, showDesignTab]);

  return (
    <div className="mx-8 flex justify-between gap-3">
      <div className="flex flex-1 items-center justify-start">
        <Logo className="fill-white w-16" />
      </div>
      <div className={containerClassName}>{Panes}</div>
      <div className="flex-1" />
    </div>
  );
};
