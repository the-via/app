import React from 'react';
import {Pane} from './pane';
import styled from 'styled-components';
import {ControlRow, Label, Detail, OverflowCell} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {ErrorMessage} from '../styled';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getShowDesignTab,
  getDisableFastRemap,
  toggleCreatorMode,
  toggleFastRemap,
} from 'src/store/settingsSlice';

const RestartMessage = styled(ErrorMessage)`
  margin: 0;
  font-size: 20px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const MenuPanel = styled(OverflowCell)`
  flex: 1;
  padding: 1rem;

  @media (min-width: 1200px) {
    border: 0 none;
    border-left: 1px solid var(--color_dark-grey);
    padding: 1.5rem;
  }
`;

export const Settings = () => {
  const dispatch = useDispatch();
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);

  return (
    <Pane>
      <OverflowCell>
        <Container>
          <ControlRow>
            <Label>Show Design tab</Label>
            <Detail>
              <AccentSlider
                onChange={() => dispatch(toggleCreatorMode())}
                isChecked={showDesignTab}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Fast Key Mapping</Label>
            <Detail>
              <AccentSlider
                onChange={() => dispatch(toggleFastRemap())}
                isChecked={!disableFastRemap}
              />
            </Detail>
          </ControlRow>
        </Container>
      </OverflowCell>
    </Pane>
  );
};
