import {FC, useState, useEffect} from 'react';
import {Detail, Label, ControlRow, SpanOverflowCell} from '../grid';
import {CenterPane} from '../pane';
import styled from 'styled-components';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {PelpiKeycodeInput} from 'src/components/inputs/pelpi/keycode-input';
import {getSelectedKeyDefinitions} from 'src/store/definitionsSlice';
import {
  getSelectedKey,
  getSelectedKeymap,
  getSelectedLayerIndex,
  updateKey,
} from 'src/store/keymapSlice';
import type {VIAKey} from '@the-via/reader';
import {
  getSelectedConnectedDevice,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {KeyboardAPI} from 'src/utils/keyboard-api';

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
  const [cwValue, setCWValue] = useState<number>();
  const [ccwValue, setCCWValue] = useState<number>();
  const selectedKey = useAppSelector(getSelectedKey);
  const dispatch = useAppDispatch();
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const layer = useAppSelector(getSelectedLayerIndex);
  if (selectedKey === null || keys[selectedKey] === undefined) {
    return null;
  }
  const val = matrixKeycodes[selectedKey];
  const encoderKey = keys[selectedKey];
  const canClick = encoderKey.col !== -1 && encoderKey.row !== -1;
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const api = useAppSelector(getSelectedKeyboardAPI);

  const setEncoderValue = (type: 'ccw' | 'cw' | 'click', val: number) => {
    if (api && encoderKey.ei !== undefined) {
      const encoderId = +encoderKey.ei;
      switch (type) {
        case 'ccw': {
          api.setEncoderValue(layer, encoderId, false, val);
          setCCWValue(val);
          break;
        }
        case 'cw': {
          api.setEncoderValue(layer, encoderId, true, val);
          setCWValue(val);
          break;
        }
        case 'click': {
          dispatch(updateKey(selectedKey, val));
          break;
        }
      }
    }
  };
  const loadValues = async (layer: number, id: number, api: KeyboardAPI) => {
    const cw = await api.getEncoderValue(layer, id, true);
    const ccw = await api.getEncoderValue(layer, id, false);
    setCWValue(cw);
    setCCWValue(ccw);
  };
  useEffect(() => {
    if (encoderKey !== undefined && encoderKey.ei !== undefined && api) {
      const encoderId = +encoderKey.ei;
      loadValues(layer, encoderId, api);
    }
  }, [encoderKey, selectedDevice, layer]);

  if (
    (selectedDevice && selectedDevice.protocol < 10) ||
    ccwValue === undefined ||
    cwValue === undefined
  ) {
    return null;
  }
  return (
    <SpanOverflowCell>
      <Encoder>
        <Container>
          <ControlRow>
            <Label>Rotate Counterclockwise</Label>
            <Detail>
              <PelpiKeycodeInput
                value={ccwValue}
                meta={{}}
                setValue={(val: number) => setEncoderValue('ccw', val)}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Rotate Clockwise</Label>
            <Detail>
              <PelpiKeycodeInput
                value={cwValue}
                meta={{}}
                setValue={(val: number) => setEncoderValue('cw', val)}
              />
            </Detail>
          </ControlRow>
          {canClick && (
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
          )}
        </Container>
      </Encoder>
    </SpanOverflowCell>
  );
};
