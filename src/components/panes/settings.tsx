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

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

export const Settings = () => {
  const dispatch = useDispatch();
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);

  return (
    <Pane>
      <OverflowCell style={{flex: 1}}>
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
