import React, {FC, useState, useEffect} from 'react';
import {Detail, Label, OverflowCell, ControlRow} from '../grid';
import {CenterPane} from '../pane';
import styled from 'styled-components';
import {useAppSelector} from 'src/store/hooks';
import {PelpiKeycodeInput} from 'src/components/inputs/pelpi/keycode-input';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateSelectedKey,
} from 'src/store/keymapSlice';

const Encoder = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

export const Pane: FC = () => {
  const selectedKey = useAppSelector(getSelectedKey);
  const keys = useAppSelector(getSelectedKeyDefinitions);
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const setEncoderValue = (type: string, val: number) => {};
  if (selectedKey === null || keys[selectedKey] === undefined) {
    return null;
  }
  const val = matrixKeycodes[selectedKey];

  if (!val) {
    return null;
  }
  return (
    <OverflowCell>
      <Encoder>
        <Container>
          <ControlRow>
            <Label>Rotate Counterclockwise</Label>
            <Detail>
              <PelpiKeycodeInput
                value={val}
                meta={{}}
                setValue={(val: number) => setEncoderValue('ccw', val)}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Rotate Clockwise</Label>
            <Detail>
              <PelpiKeycodeInput
                value={val}
                meta={{}}
                setValue={(val: number) => setEncoderValue('cw', val)}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Press Encoder</Label>
            <Detail>
              <PelpiKeycodeInput
                value={val}
                meta={{}}
                setValue={(val: number) => setEncoderValue('click', val)}
              />
            </Detail>
          </ControlRow>
        </Container>
      </Encoder>
    </OverflowCell>
  );
};
