import React from 'react';
import styled from 'styled-components';
import {Link, useLocation} from 'wouter';
import PANES from '../../utils/pane-config';
import {useAppSelector} from 'src/store/hooks';
import {getShowDesignTab} from 'src/store/settingsSlice';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {CategoryMenuTooltip} from '../inputs/tooltip';
import {CategoryIconContainer} from '../panes/grid';
import {VIALogo} from '../icons/via';
import {faDiscord, faGithub} from '@fortawesome/free-brands-svg-icons';

const Container = styled.div`
  width: 100vw;
  height: 25px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border_color_cell);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const {DEBUG_PROD, MODE, DEV} = import.meta.env;
const showDebugPane = MODE === 'development' || DEBUG_PROD === 'true' || DEV;

const GlobalContainer = styled(Container)`
  background: var(--bg_outside-accent);
  column-gap: 20px;
`;

const ExternalLinkContainer = styled.span`
  position: absolute;
  right: 1em;
  display: flex;
  gap: 1em;
`;

export const UnconnectedGlobalMenu = () => {
  const showDesignTab = useAppSelector(getShowDesignTab);

  const [location] = useLocation();

  const Panes = React.useMemo(() => {
    return PANES.map((pane) => {
      if (pane.key === 'design' && !showDesignTab) return null;
      if (pane.key === 'debug' && !showDebugPane) return null;
      return (
        <Link key={pane.key} to={pane.path}>
          <CategoryIconContainer $selected={pane.path === location}>
            <FontAwesomeIcon size={'xl'} icon={pane.icon} />
            <CategoryMenuTooltip>{pane.title}</CategoryMenuTooltip>
          </CategoryIconContainer>
        </Link>
      );
    });
  }, [location, showDesignTab]);

  const ExternalLinks = () => (
    <ExternalLinkContainer>
      <a href="https://caniusevia.com/" target="_blank">
        <CategoryIconContainer>
          <VIALogo height="25px" fill="currentColor"></VIALogo>
          <CategoryMenuTooltip>Firmware + Docs</CategoryMenuTooltip>
        </CategoryIconContainer>
      </a>
      <a href="https://discord.gg/NStTR5YaPB" target="_blank">
        <CategoryIconContainer>
          <FontAwesomeIcon size={'xl'} icon={faDiscord} />
          <CategoryMenuTooltip>Discord</CategoryMenuTooltip>
        </CategoryIconContainer>
      </a>
      <a href="https://github.com/the-via/app" target="_blank">
        <CategoryIconContainer>
          <FontAwesomeIcon size={'xl'} icon={faGithub} />
          <CategoryMenuTooltip>Github</CategoryMenuTooltip>
        </CategoryIconContainer>
      </a>
    </ExternalLinkContainer>
  );

  return (
    <React.Fragment>
      <GlobalContainer>
        {Panes}
        <ExternalLinks />
      </GlobalContainer>
    </React.Fragment>
  );
};
