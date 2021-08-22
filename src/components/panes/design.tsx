import * as React from 'react';
import {bindActionCreators} from 'redux';
import useResize from 'react-resize-observer-hook';
import {Pane} from './pane';
import styled from 'styled-components';
import {ErrorMessage} from '../styled';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import {AccentSelect} from '../inputs/accent-select';
import {AccentSlider} from '../inputs/accent-slider';
import {AccentUploadButton} from '../inputs/accent-upload-button';
import Layouts from '../Layouts';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUpload} from '@fortawesome/free-solid-svg-icons';
import {
  keyboardDefinitionV2ToVIADefinitionV2,
  isVIADefinitionV2,
  isKeyboardDefinitionV2,
  keyboardDefinitionV3ToVIADefinitionV3,
  isVIADefinitionV3,
  isKeyboardDefinitionV3,
} from 'via-reader';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';
import {BlankPositionedKeyboard} from '../positioned-keyboard';
import {
  getDefinitions,
  getCustomDefinitions,
  getBaseDefinitions,
  getSelectedAPI,
  getConnectedDevices,
  reloadConnectedDevices,
  actions,
} from '../../redux/modules/keymap';
import type {RootState} from '../../redux';
import {
  ControlRow,
  Label,
  SubLabel,
  Detail,
  IndentedControlRow,
  OverflowCell,
  FlexCell,
} from './grid';
import {
  getDevicesUsingDefinitions,
  getVendorProductId,
} from '../../utils/hid-keyboards';
import type {DefinitionVersion} from 'src/types/types';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const mapDispatchToProps: MapDispatchToPropsFunction<any, any> = (dispatch) =>
  bindActionCreators(
    {
      loadDefinition: actions.loadDefinition,
      validateDevices: actions.validateDevices,
      selectDevice: actions.selectDevice,
      reloadConnectedDevices,
    },
    dispatch,
  );

const mapStateToProps = ({keymap}: RootState) => ({
  api: getSelectedAPI(keymap),
  connectedDevices: getConnectedDevices(keymap),
  allDefinitions: getDefinitions(keymap),
  remoteDefinitions: Object.entries(getBaseDefinitions(keymap)),
  localDefinitions: Object.entries(getCustomDefinitions(keymap)),
});

const DesignErrorMessage = styled(ErrorMessage)`
  margin: 0;
  font-style: italic;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const DesignPane = styled(Pane)`
  display: grid;
  max-width: 100vw;
  grid-template-columns: 100vw;
  grid-template-rows: min-content;
`;

const UploadIcon = styled.div`
  height: 200px;
  width: 50%;
  max-width: 560px;
  border-radius: 6px;
  animation-duration: 1.5s;
  animation-name: border-glow;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    color: transparent;
    stroke-width: 8px;
    animation-duration: 1.5s;
    animation-name: text-glow;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
    font-size: 100px;
  }
`;

// TODO: insert branching logic for v2 vs v3 def
function importDefinition(
  props: Props,
  file: File,
  setErrors: (errors: string[]) => void,
  version: DefinitionVersion,
) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      if (!reader.result) return;
      const res = JSON.parse(reader.result.toString());
      const isValid =
        version === 'v2'
          ? isKeyboardDefinitionV2(res) || isVIADefinitionV2(res)
          : isKeyboardDefinitionV3(res) || isVIADefinitionV3(res);
      if (isValid) {
        setErrors([]);
        const definition =
          version === 'v2'
            ? isVIADefinitionV2(res)
              ? res
              : keyboardDefinitionV2ToVIADefinitionV2(res)
            : isVIADefinitionV3(res)
            ? res
            : keyboardDefinitionV3ToVIADefinitionV3(res);
        props.loadDefinition({definition, version});
        const keyboards = await getDevicesUsingDefinitions(
          props.allDefinitions,
        );
        props.validateDevices(
          keyboards.filter(
            (device) =>
              res.vendorProductId !==
              getVendorProductId(device.vendorId, device.productId),
          ),
        );
        props.selectDevice(null);
        props.reloadConnectedDevices();
      } else {
        setErrors(
          (version === 'v2'
            ? isKeyboardDefinitionV2.errors || isVIADefinitionV2.errors || []
            : isKeyboardDefinitionV3.errors || isVIADefinitionV3.errors || []
          ).map(
            (e) => `${e.dataPath ? e.dataPath + ': ' : 'Object: '}${e.message}`,
          ),
        );
      }
    } catch (err) {
      setErrors([`${err.name}: ${err.message}`]);
    }
  };
  reader.readAsBinaryString(file);
}
function onDrop(
  evt: React.DragEvent<HTMLElement>,
  props: Props,
  setErrors: (errors: string[]) => void,
) {
  evt.preventDefault();
  const {dataTransfer} = evt;
  if (dataTransfer?.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (
        dataTransfer.items[i].kind === 'file' &&
        dataTransfer.items[i].type === 'application/json'
      ) {
        var file = dataTransfer.items[i].getAsFile();
        if (file) {
          importDefinition(props, file, setErrors, props.definitionVersion);
        }
      }
    }
  }
}

function DesignTab(props: Props) {
  const {localDefinitions} = props;
  const [selectedDefinitionIndex, setSelectedDefinition] = React.useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = React.useState<number[]>(
    [],
  );
  const [showMatrix, setShowMatrix] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [dimensions, setDimensions] = React.useState({
    width: 1280,
    height: 900,
  });
  const [definitionVersion, setDefinitionVersion] =
    React.useState<DefinitionVersion>('v3');

  const options = localDefinitions.map(
    (
      [, definition]: [string, VIADefinitionV2 | VIADefinitionV3],
      index: number,
    ) => ({
      label: definition.name,
      value: index,
    }),
  );

  const flexRef = React.useRef(null);
  useResize(
    flexRef,
    (entry) =>
      flexRef.current &&
      setDimensions({
        width: entry.width,
        height: entry.height,
      }),
  );
  const entry =
    localDefinitions[selectedDefinitionIndex] &&
    localDefinitions[selectedDefinitionIndex][definitionVersion];

  return (
    <DesignPane
      onDragOver={(evt) => {
        evt.dataTransfer.effectAllowed = 'copyMove';
        evt.dataTransfer.dropEffect = 'none';
        evt.preventDefault();
        evt.stopPropagation();
      }}
    >
      <FlexCell ref={flexRef}>
        {entry ? (
          <BlankPositionedKeyboard
            containerDimensions={dimensions}
            selectedDefinition={entry[1]}
            selectedOptionKeys={selectedOptionKeys}
            showMatrix={showMatrix}
          />
        ) : (
          <UploadIcon
            onDrop={(evt) =>
              onDrop(evt, {...props, definitionVersion}, setErrors)
            }
            onDragOver={(evt) => {
              evt.dataTransfer.effectAllowed = 'copyMove';
              evt.dataTransfer.dropEffect = 'copy';
              evt.preventDefault();
              evt.stopPropagation();
            }}
          >
            <FontAwesomeIcon icon={faUpload} />
          </UploadIcon>
        )}
      </FlexCell>
      <OverflowCell>
        <Container>
          <ControlRow>
            <Label>Load Draft Definition</Label>
            <Detail>
              <AccentUploadButton
                onLoad={(file) =>
                  importDefinition(props, file, setErrors, definitionVersion)
                }
              >
                Load
              </AccentUploadButton>
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Enabled legacy mode (V2 definitions)</Label>
            <Detail>
              <AccentSlider
                isChecked={definitionVersion === 'v2'}
                onChange={(val) => setDefinitionVersion(val ? 'v2' : 'v3')}
              />
            </Detail>
          </ControlRow>
          {entry && (
            <ControlRow>
              <Label>Shown Keyboard Definition</Label>
              <Detail>
                <AccentSelect
                  onChange={(option) => {
                    // Reset selected layouts when choosing a different
                    // definition
                    setSelectedOptionKeys(() => []);

                    if (option) {
                      setSelectedDefinition(+option.value);
                    }
                  }}
                  value={options[selectedDefinitionIndex]}
                  options={options}
                />
              </Detail>
            </ControlRow>
          )}
          {entry && (
            <Layouts
              definition={entry[1]}
              onLayoutChange={(newSelectedOptionKeys) => {
                setSelectedOptionKeys(newSelectedOptionKeys);
              }}
            />
          )}
          {entry && (
            <ControlRow>
              <Label>Show Matrix</Label>
              <Detail>
                <AccentSlider isChecked={showMatrix} onChange={setShowMatrix} />
              </Detail>
            </ControlRow>
          )}
          {errors.map((error) => (
            <IndentedControlRow>
              <DesignErrorMessage>{error}</DesignErrorMessage>
            </IndentedControlRow>
          ))}
          <ControlRow>
            <Label>Draft Definitions</Label>
            <Detail>
              {Object.values(localDefinitions).length} Definitions
            </Detail>
          </ControlRow>
          {(
            Object.values(localDefinitions) as [
              string,
              VIADefinitionV2 | VIADefinitionV3,
            ][]
          ).map(([id, definition]) => {
            return (
              <IndentedControlRow>
                <SubLabel>{definition.name}</SubLabel>
                <Detail>
                  0x
                  {parseInt(id).toString(16).toUpperCase()}
                </Detail>
              </IndentedControlRow>
            );
          })}
        </Container>
      </OverflowCell>
    </DesignPane>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DesignTab);
