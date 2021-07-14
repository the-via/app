import * as React from 'react';
import {bindActionCreators} from 'redux';
import useResize from 'react-resize-observer-hook';
import {Pane} from './pane';
import styled from 'styled-components';
import {ErrorMessage} from '../styled';
import {connect} from 'react-redux';
import {AccentSelect} from '../inputs/accent-select';
import {AccentSlider} from '../inputs/accent-slider';
import {AccentUploadButton} from '../inputs/accent-upload-button';
import Layouts from '../Layouts';
import {
  keyboardDefinitionV2ToVIADefinitionV2,
  isVIADefinitionV2,
  isKeyboardDefinitionV2
} from 'via-reader';
import {BlankPositionedKeyboard} from '../positioned-keyboard';
import {
  getDefinitions,
  getCustomDefinitions,
  getBaseDefinitions,
  getSelectedAPI,
  getConnectedDevices,
  reloadConnectedDevices,
  actions
} from '../../redux/modules/keymap';
import {RootState} from '../../redux';
import {
  ControlRow,
  Label,
  SubLabel,
  Detail,
  IndentedControlRow,
  OverflowCell,
  FlexCell
} from './grid';
import {
  getDevicesUsingDefinitions,
  getVendorProductId
} from '../../utils/hid-keyboards';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadDefinition: actions.loadDefinition,
      validateDevices: actions.validateDevices,
      selectDevice: actions.selectDevice,
      reloadConnectedDevices
    },
    dispatch
  );

const mapStateToProps = ({keymap}: RootState) => ({
  api: getSelectedAPI(keymap),
  connectedDevices: getConnectedDevices(keymap),
  allDefinitions: getDefinitions(keymap),
  remoteDefinitions: Object.entries(getBaseDefinitions(keymap)),
  localDefinitions: Object.entries(getCustomDefinitions(keymap))
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
  i {
    color: transparent;
    animation-duration: 1.5s;
    animation-name: text-glow;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
    font-size: 100px;
  }
`;

function importDefinition(
  props: Props,
  file: File,
  setErrors: (errors: string[]) => void
) {
  const reader = new FileReader();
  reader.onload = async () => {
    let res;
    try {
      res = JSON.parse(reader.result.toString());
      const isValid = isKeyboardDefinitionV2(res) || isVIADefinitionV2(res);
      if (isValid) {
        setErrors([]);
        const definition = isVIADefinitionV2(res)
          ? res
          : keyboardDefinitionV2ToVIADefinitionV2(res);
        props.loadDefinition(definition);
        const keyboards = getDevicesUsingDefinitions(props.allDefinitions);
        props.validateDevices(
          keyboards.filter(
            device =>
              res.vendorProductId !==
              getVendorProductId(device.vendorId, device.productId)
          )
        );
        props.selectDevice(null);
        props.reloadConnectedDevices();
      } else {
        setErrors(
          (isKeyboardDefinitionV2.errors || isVIADefinitionV2.errors).map(
            e => `${e.dataPath ? e.dataPath + ': ' : 'Object: '}${e.message}`
          )
        );
      }
    } catch (err) {
      setErrors([`${err.name}: ${err.message}`]);
    }
  };
  reader.readAsBinaryString(file);
}
function onDrop(evt, props: Props, setErrors: (errors: string[]) => void) {
  evt.preventDefault();
  if (evt.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < evt.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (
        evt.dataTransfer.items[i].kind === 'file' &&
        evt.dataTransfer.items[i].type === 'application/json'
      ) {
        var file = evt.dataTransfer.items[i].getAsFile();
        importDefinition(props, file, setErrors);
      }
    }
  }
}

function DesignTab(props: Props) {
  const {localDefinitions} = props;
  const [selectedDefinitionIndex, setSelectedDefinition] = React.useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = React.useState<number[]>(
    []
  );
  const [showMatrix, setShowMatrix] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [dimensions, setDimensions] = React.useState({
    width: 1280,
    height: 900
  });

  const options = localDefinitions.map(([, definition], index) => ({
    label: definition.name,
    value: index
  }));

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
  const entry = localDefinitions[selectedDefinitionIndex];

  return (
    <DesignPane
      onDragOver={evt => {
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
            onDrop={evt => onDrop(evt, props, setErrors)}
            onDragOver={evt => {
              evt.dataTransfer.effectAllowed = 'copyMove';
              evt.dataTransfer.dropEffect = 'copy';
              evt.preventDefault();
              evt.stopPropagation();
            }}
          >
            <i className="fas fa-upload"></i>
          </UploadIcon>
        )}
      </FlexCell>
      <OverflowCell>
        <Container>
          <ControlRow>
            <Label>Load Draft Definition</Label>
            <Detail>
              <AccentUploadButton
                onLoad={file => importDefinition(props, file, setErrors)}
              >
                Load
              </AccentUploadButton>
            </Detail>
          </ControlRow>
          {entry && (
            <ControlRow>
              <Label>Shown Keyboard Definition</Label>
              <Detail>
                <AccentSelect
                  onChange={option => {
                    // Reset selected layouts when choosing a different
                    // definition
                    setSelectedOptionKeys(() => []);

                    setSelectedDefinition(+option.value);
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
              onLayoutChange={newSelectedOptionKeys => {
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
          {errors.map(error => (
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
          {Object.values(localDefinitions).map(([id, definition]) => (
            <IndentedControlRow>
              <SubLabel>{definition.name}</SubLabel>
              <Detail>
                0x
                {parseInt(id)
                  .toString(16)
                  .toUpperCase()}
              </Detail>
            </IndentedControlRow>
          ))}
        </Container>
      </OverflowCell>
    </DesignPane>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DesignTab);
