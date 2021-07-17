import * as React from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
const {useState, useEffect} = React;
import useResize from 'react-resize-observer-hook';
import {Pane} from './pane';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {PROTOCOL_GAMMA, KeyboardValue} from '../../utils/keyboard-api';
import {TestKeyboard, TestKeyState} from '../test-keyboard';
import {
  matrixKeycodes,
  getIndexByEvent
} from '../inputs/musical-key-slider';
import {
  getDefinitions,
  getCustomDefinitions,
  getBaseDefinitions,
  getSelectedAPI,
  getConnectedDevices,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
  getSelectedConnectedDevice
} from '../../redux/modules/keymap';
import {actions as SettingsActions} from '../../redux/modules/settings';
import {RootState} from '../../redux';
import {
  ControlRow,
  Label,
  Detail,
  OverflowCell,
  FlexCell,
  Grid1Col
} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {AccentButton} from '../inputs/accent-button';

type ReduxState = ReturnType<typeof mapStateToProps>;

type ReduxDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = ReduxState & ReduxDispatch;

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setTestMatrixEnabled: SettingsActions.setTestMatrixEnabled
    },
    dispatch
  );
};
const mapStateToProps = ({keymap, settings}: RootState) => ({
  api: getSelectedAPI(keymap),
  connectedDevices: getConnectedDevices(keymap),
  selectedDefinition: getSelectedDefinition(keymap),
  allDefinitions: Object.entries(getDefinitions(keymap)),
  remoteDefinitions: Object.entries(getBaseDefinitions(keymap)),
  localDefinitions: Object.entries(getCustomDefinitions(keymap)),
  keyDefinitions: getSelectedKeyDefinitions(keymap),
  isTestMatrixEnabled: settings.isTestMatrixEnabled,
  canUseMatrixState:
    !!getSelectedConnectedDevice(keymap) &&
    PROTOCOL_GAMMA <= getSelectedConnectedDevice(keymap).protocol
});

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const TestPane = styled(Pane)`
  display: flex;
  height: 100%;
  max-width: 100vw;
  flex-direction: column;
`;

let startTest = false;

const invertTestKeyState = (s: TestKeyState) =>
  s === TestKeyState.KeyDown ? TestKeyState.KeyUp : TestKeyState.KeyDown;

function Test(props: Props) {
  const [dimensions, setDimensions] = useState({
    width: 1280,
    height: 900
  });
  const [selectedKeys, setSelectedKeys] = useState({});
  let flat = [];

  // If pressed key is our target key then set to true
  function downHandler(evt) {
    evt.preventDefault();
    if (
      !startTest &&
      selectedKeys[getIndexByEvent(evt)] !== TestKeyState.KeyDown
    ) {
      setSelectedKeys(selectedKeys => ({
        ...selectedKeys,
        [getIndexByEvent(evt)]: TestKeyState.KeyDown
      }));
    }
  }

  // If released key is our target key then set to false
  const upHandler = evt => {
    evt.preventDefault();
    if (
      !startTest &&
      selectedKeys[getIndexByEvent(evt)] !== TestKeyState.KeyUp
    ) {
      setSelectedKeys(selectedKeys => ({
        ...selectedKeys,
        [getIndexByEvent(evt)]: TestKeyState.KeyUp
      }));
    }
  };

  async function useMatrixTest() {
    const {api, selectedDefinition} = props;
    if (startTest && props.api && selectedDefinition) {
      const {cols, rows} = selectedDefinition.matrix;
      const bytesPerRow = Math.ceil(cols / 8);
      try {
        const newFlat = await api.getKeyboardValue(
          KeyboardValue.SWITCH_MATRIX_STATE,
          bytesPerRow * rows
        );

        const keysChanges =
          0 !==
          newFlat.reduce((prev, val, byteIdx) => {
            return (prev + val) ^ (flat[byteIdx] || 0);
          }, 0);
        if (!keysChanges) {
          await api.timeout(20);
          useMatrixTest();
          return;
        }
        setSelectedKeys(selectedKeys => {
          const newPressedKeys = newFlat.reduce(
            (res, val, byteIdx) => {
              const xor = val ^ (flat[byteIdx] || 0);
              if (xor === 0) {
                return res;
              }
              const row = ~~(byteIdx / bytesPerRow);

              const colOffset = 8 * (bytesPerRow - 1 - (byteIdx % bytesPerRow));
              return Array(Math.max(0, Math.min(8, cols - colOffset)))
                .fill(0)
                .reduce((resres, _, idx) => {
                  const matrixIdx = cols * row + idx + colOffset;
                  resres[matrixIdx] =
                    ((xor >> idx) & 1) === 1
                      ? invertTestKeyState(resres[matrixIdx])
                      : resres[matrixIdx];
                  return resres;
                }, res);
            },
            Array.isArray(selectedKeys) && selectedKeys.length === rows * cols
              ? [...selectedKeys]
              : Array(rows * cols).fill(TestKeyState.Initial)
          );
          return newPressedKeys;
        });
        flat = newFlat;
        await api.timeout(20);
        useMatrixTest();
      } catch (e) {
        startTest = false;
        props.setTestMatrixEnabled(false);
      }
    }
  }

  const onClickHandler = _ => {
    flat = [];
    setSelectedKeys({});
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      startTest = false;
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const flexRef = React.useRef(null);
  useResize(
    flexRef,
    entry =>
      flexRef.current &&
      setDimensions({
        width: entry.width,
        height: entry.height
      })
  );
  const pressedKeys =
    !props.isTestMatrixEnabled || !props.keyDefinitions
      ? selectedKeys
      : props.keyDefinitions.map(
          ({row, col}) =>
            selectedKeys[row * props.selectedDefinition.matrix.cols + col]
        );
  const testDefinition = props.isTestMatrixEnabled
    ? props.selectedDefinition
    : fullKeyboardDefinition;
  const testKeys = props.isTestMatrixEnabled
    ? props.keyDefinitions
    : fullKeyboardDefinition.layouts.keys;
  return (
    <TestPane>
      <Grid1Col>
        <FlexCell ref={flexRef}>
          <TestKeyboard
            definition={testDefinition}
            keys={testKeys}
            pressedKeys={pressedKeys}
            matrixKeycodes={props.isTestMatrixEnabled ? [] : matrixKeycodes}
            containerDimensions={dimensions}
          />
        </FlexCell>
        <OverflowCell>
          <Container>
            <ControlRow>
              <Label>Reset Keyboard</Label>
              <Detail>
                <AccentButton onClick={onClickHandler}>Reset</AccentButton>
              </Detail>
            </ControlRow>
            {props.canUseMatrixState && props.selectedDefinition ? (
              <ControlRow>
                <Label>Test Matrix</Label>
                <Detail>
                  <AccentSlider
                    isChecked={props.isTestMatrixEnabled}
                    onChange={val => {
                      startTest = val;

                      props.setTestMatrixEnabled(val);

                      if (val) {
                        setSelectedKeys([]);
                        useMatrixTest();
                      } else {
                        setSelectedKeys({});
                      }
                    }}
                  />
                </Detail>
              </ControlRow>
            ) : null}
          </Container>
        </OverflowCell>
      </Grid1Col>
    </TestPane>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Test);
