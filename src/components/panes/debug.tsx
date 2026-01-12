import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {FC, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  getBaseDefinitions,
  getBasicKeyToByte,
  getCustomDefinitions,
  getDefinitions,
} from 'src/store/definitionsSlice';
import {
  getConnectedDevices,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelected256PaletteColor,
  setSelectedPaletteColor,
} from 'src/store/keymapSlice';
import {getNextKey} from 'src/utils/keyboard-rendering';
import {RawKeycodeSequenceAction} from 'src/utils/macro-api/types';
import styled from 'styled-components';
import {anyKeycodeToString} from '../../utils/advanced-keys';
import {KeyboardValue} from '../../utils/keyboard-api';
import {AccentButton} from '../inputs/accent-button';
import {AccentRange} from '../inputs/accent-range';
import {AccentSelect} from '../inputs/accent-select';
import {AccentSlider} from '../inputs/accent-slider';
import {ColorPalettePicker} from '../inputs/color-palette-picker';
import {ArrayColorPicker} from '../inputs/color-picker';
import {PelpiKeycodeInput} from '../inputs/pelpi/keycode-input';
import TextInput from '../inputs/text-input';
import Layouts from '../Layouts';
import {MacroRecorder} from './configure-panes/submenus/macros/macro-recorder';
import {
  ControlRow,
  Detail,
  IndentedControlRow,
  Label,
  OverflowCell,
  SubLabel,
} from './grid';
import {Pane} from './pane';

// TODO: should we differentiate between firwmare versions in the UI?
type KeyboardDefinitionEntry = [string, VIADefinitionV2 | VIADefinitionV3];

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const ControlGroup = styled.div`
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  width: 100%;

  max-width: 960px;
  &:last-child {
    padding-bottom: 0;
  }
`;

const ControlGroupHeader = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const TestControls = () => {
  const [isChecked, setIsChecked] = useState(true);
  const [rangeVal, setRangeVal] = useState(0);
  const [colorVal, setColorVal] = useState<[number, number]>([0, 0]);
  const [selectionVal, setSelectionVal] = useState(0);
  const [keycode, setKeycode] = useState(0);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const selectedPaletteColor = useAppSelector(getSelected256PaletteColor);
  const dispatch = useDispatch();
  const selectOptions = [
    {label: 'Option 1', value: '0'},
    {label: 'Option 2', value: '1'},
  ];
  return (
    <ControlGroup>
      <ControlGroupHeader>Controls</ControlGroupHeader>
      <ControlRow>
        <Label>Button</Label>
        <Detail>
          <AccentButton>Click</AccentButton>
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>Disabled Button</Label>
        <Detail>
          <AccentButton disabled>Disabled</AccentButton>
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>Text Input</Label>
        <Detail>
          <TextInput />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>
          {keycode} / {anyKeycodeToString(keycode, basicKeyToByte, byteToKey)}
        </Label>
        <Detail>
          <PelpiKeycodeInput value={keycode} setValue={setKeycode} meta={{}} />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>
          {colorVal[0]}, {colorVal[1]}
        </Label>
        <Detail>
          <ArrayColorPicker
            color={colorVal}
            setColor={(hue, sat) => setColorVal([hue, sat])}
          />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>
          {selectedPaletteColor[0]}, {selectedPaletteColor[1]}
        </Label>
        <Detail>
          <ColorPalettePicker
            color={selectedPaletteColor}
            setColor={(hue, sat) =>
              dispatch(setSelectedPaletteColor([hue, sat]))
            }
          />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>{rangeVal}</Label>
        <Detail>
          <AccentRange
            max={100}
            min={0}
            defaultValue={rangeVal}
            onChange={setRangeVal}
          />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>{+isChecked}</Label>
        <Detail>
          <AccentSlider isChecked={isChecked} onChange={setIsChecked} />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>{+selectionVal}</Label>
        <Detail>
          <AccentSelect
            value={selectOptions[selectionVal]}
            options={selectOptions}
            onChange={(option: any) => {
              option && setSelectionVal(+option.value);
            }}
          />
        </Detail>
      </ControlRow>
      <MacroRecorder
        selectedMacro={[[RawKeycodeSequenceAction.Delay, 4]]}
        setUnsavedMacro={(_) => _}
        undoMacro={() => null}
        saveMacro={() => null}
        isDelaySupported={true}
      />
      <MacroRecorder
        setUnsavedMacro={(_) => _}
        undoMacro={() => null}
        saveMacro={() => null}
        isDelaySupported={true}
      />
    </ControlGroup>
  );
};

export const Debug: FC = () => {
  const api = useAppSelector(getSelectedKeyboardAPI);
  const connectedDevices = useAppSelector(getConnectedDevices);

  // Temporary patch that gets the page to load
  // TODO: We probably need to rethink this + design a bit. Loading defs in design causes this to crash
  const allDefinitions = Object.entries(useAppSelector(getDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const remoteDefinitions = Object.entries(useAppSelector(getBaseDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const localDefinitions = Object.entries(useAppSelector(getCustomDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const [selectedDefinitionIndex, setSelectedDefinition] = useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<number[]>([]);
  const [selectedKey, setSelectedKey] = useState<undefined | number>(0);
  const [showMatrix, setShowMatrix] = useState(false);

  const options = allDefinitions.map(([, definition], index) => ({
    label: definition.name,
    value: `${index}`,
  }));
  const entry = allDefinitions[selectedDefinitionIndex];

  return (
    <Pane>
      <OverflowCell>
        <Container>
          {/* <GithubUserData /> */}
          <ControlGroup>
            <ControlGroupHeader>Key Testing</ControlGroupHeader>
            <ControlRow>
              <Label>Show Matrix</Label>
              <Detail>
                <AccentSlider
                  isChecked={showMatrix}
                  onChange={(val) => setShowMatrix(val)}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Set next key</Label>
              <Detail>
                <AccentButton
                  onClick={() => {
                    const {keys, optionKeys} = entry[1].layouts;
                    const selectedOptionKeys = optionKeys
                      ? Object.entries(optionKeys).flatMap(
                          ([key, options]) => options[0],
                        )
                      : [];
                    const displayedKeys = [...keys, ...selectedOptionKeys];
                    if (selectedKey !== undefined) {
                      setSelectedKey(
                        getNextKey(selectedKey, displayedKeys) || 0,
                      );
                    }
                  }}
                >
                  Next
                </AccentButton>
              </Detail>
            </ControlRow>
          </ControlGroup>
          {options && (
            <ControlGroup>
              <ControlGroupHeader>Layout Testing</ControlGroupHeader>
              <ControlRow>
                <Label>Dummy Keyboard</Label>
                <Detail>
                  <AccentSelect
                    onChange={(option: any) =>
                      option && setSelectedDefinition(+option.value)
                    }
                    defaultValue={options[0]}
                    options={options}
                  />
                </Detail>
              </ControlRow>
            </ControlGroup>
          )}
          {entry && (
            <Layouts
              definition={entry[1]}
              onLayoutChange={(newSelectedOptionKeys) => {
                setSelectedOptionKeys(newSelectedOptionKeys);
              }}
            />
          )}
          {api && (
            <ControlGroup>
              <ControlGroupHeader>
                Connected Device Debugging
              </ControlGroupHeader>
              <ControlRow>
                <Label>EEPROM Reset</Label>
                <Detail>
                  <AccentButton onClick={() => api.resetEEPROM()}>
                    Reset
                  </AccentButton>
                </Detail>
              </ControlRow>
              <ControlRow>
                <Label>Bootloader Jump</Label>
                <Detail>
                  <AccentButton onClick={() => api.jumpToBootloader()}>
                    Jump
                  </AccentButton>
                </Detail>
              </ControlRow>
              <ControlRow>
                <Label>Clear all macros</Label>
                <Detail>
                  <AccentButton onClick={() => api.resetMacros()}>
                    Clear
                  </AccentButton>
                </Detail>
              </ControlRow>
              <ControlRow>
                <Label>Benchmark Switch State Query Speed</Label>
                <Detail>
                  <AccentButton
                    onClick={async () => {
                      const start = performance.now();
                      await Array(1000)
                        .fill(0)
                        .map((_) =>
                          api.getKeyboardValue(
                            KeyboardValue.SWITCH_MATRIX_STATE,
                            [],
                            20,
                          ),
                        );
                      console.info(
                        '1000 commands in ',
                        performance.now() - start,
                        'ms',
                      );
                    }}
                  >
                    Benchmark
                  </AccentButton>
                </Detail>
              </ControlRow>
            </ControlGroup>
          )}
          <ControlGroup>
            <ControlGroupHeader>Device IDs</ControlGroupHeader>
            <ControlRow>
              <Label>Connected Devices</Label>
              <Detail>{Object.values(connectedDevices).length} Devices</Detail>
            </ControlRow>
            {Object.values(connectedDevices).map((device) => {
              const definitionEntry = allDefinitions.find(
                ([id]) => id === device.vendorProductId.toString(),
              ) as KeyboardDefinitionEntry;
              if (definitionEntry) {
                return (
                  <IndentedControlRow key={device.path}>
                    <SubLabel>
                      {
                        (
                          definitionEntry[1] as
                            | VIADefinitionV2
                            | VIADefinitionV3
                        ).name
                      }
                    </SubLabel>
                    <Detail>
                      0x{device.vendorProductId.toString(16).toUpperCase()}
                    </Detail>
                  </IndentedControlRow>
                );
              }
              return null;
            })}
            <ControlRow>
              <Label>Local definitions</Label>
              <Detail>
                {Object.values(localDefinitions).length} Definitions
              </Detail>
            </ControlRow>
            {Object.values(localDefinitions).map(([id, definition], idx) => (
              <IndentedControlRow key={idx}>
                <SubLabel>{definition.name}</SubLabel>
                <Detail>
                  0x
                  {parseInt(id).toString(16).toUpperCase()}
                </Detail>
              </IndentedControlRow>
            ))}
            <ControlRow>
              <details>
                <summary>
                  <Label>Remote definitions</Label>
                  <Detail>
                    {Object.values(remoteDefinitions).length} Definitions
                  </Detail>
                </summary>
                {Object.values(remoteDefinitions).map(
                  ([id, definition], idx) => (
                    <IndentedControlRow key={idx}>
                      <SubLabel>{definition.name}</SubLabel>
                      <Detail>
                        0x
                        {parseInt(id).toString(16).toUpperCase()}
                      </Detail>
                    </IndentedControlRow>
                  ),
                )}
              </details>
            </ControlRow>
          </ControlGroup>
          <TestControls />
        </Container>
      </OverflowCell>
    </Pane>
  );
};
