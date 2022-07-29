import React, {useState, FC, useRef, Dispatch, DragEvent, useMemo} from 'react';
import useResize from 'react-resize-observer-hook';
import {Pane} from './pane';
import styled from 'styled-components';
import {ErrorMessage} from '../styled';
import {getCommonMenus} from 'src/utils/device-store';
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
import type {DefinitionVersion} from 'via-reader';
import {BlankPositionedKeyboard} from '../positioned-keyboard';
import {
  ControlRow,
  Label,
  SubLabel,
  Detail,
  IndentedControlRow,
  OverflowCell,
  FlexCell,
} from './grid';
import {useDispatch} from 'react-redux';
import {selectDevice, ensureSupportedId} from 'src/store/devicesSlice';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {useAppSelector} from 'src/store/hooks';
import {getCustomDefinitions, loadDefinition} from 'src/store/definitionsSlice';
import {getSelectedVersion, selectVersion} from 'src/store/designSlice';

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

// TODO: move this inside function component and then use the closured dispatch?
function importDefinition(
  file: File,
  version: DefinitionVersion,
  dispatch: Dispatch<any>,
  setErrors: (errors: string[]) => void,
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

        if (isVIADefinitionV3(res) || isKeyboardDefinitionV3(res)) {
          const commonMenuKeys = Object.keys(getCommonMenus());
          const lookupFailedKeys = (res.menus || []).filter((menu) => {
            if (typeof menu === 'string') {
              return !commonMenuKeys.includes(menu);
            }
            return false;
          });
          if (lookupFailedKeys.length) {
            throw Error(
              `Menu key lookup failed for: ${lookupFailedKeys.join(', ')}`,
            );
          }
        }
        dispatch(loadDefinition({definition, version}));

        dispatch(
          ensureSupportedId({
            productId: definition.vendorProductId as number,
            version,
          }),
        );
        dispatch(selectDevice(null));
        dispatch(reloadConnectedDevices());
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
    } catch (err: any) {
      if (err.name) {
        setErrors([`${err.name}: ${err.message}`]);
      } else {
        setErrors([`${err}`]);
      }
    }
  };
  reader.readAsBinaryString(file);
}

function onDrop(
  evt: DragEvent<HTMLElement>,
  version: DefinitionVersion,
  dispatch: Dispatch<any>,
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
          importDefinition(file, version, dispatch, setErrors);
        }
      }
    }
  }
}

export const DesignTab: FC = () => {
  const dispatch = useDispatch();
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getSelectedVersion);

  const [selectedDefinitionIndex, setSelectedDefinition] = useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<number[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({
    width: 1280,
    height: 900,
  });
  const versionDefinitions = useMemo(
    () =>
      localDefinitions.filter(
        (definitionMap) => definitionMap[definitionVersion],
      ),
    [localDefinitions, definitionVersion],
  );

  const options = versionDefinitions.map((definitionMap, index) => ({
    label: definitionMap[definitionVersion].name,
    value: index.toString(),
  }));

  const flexRef = useRef(null);
  useResize(
    flexRef,
    (entry) =>
      flexRef.current &&
      setDimensions({
        width: entry.width,
        height: entry.height,
      }),
  );
  const definition =
    versionDefinitions[selectedDefinitionIndex] &&
    versionDefinitions[selectedDefinitionIndex][definitionVersion];

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
        {definition ? (
          <BlankPositionedKeyboard
            containerDimensions={dimensions}
            selectedDefinition={definition}
            selectedOptionKeys={selectedOptionKeys}
            showMatrix={showMatrix}
          />
        ) : (
          <UploadIcon
            onDrop={(evt) =>
              onDrop(evt, definitionVersion, dispatch, setErrors)
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
                  importDefinition(file, definitionVersion, dispatch, setErrors)
                }
              >
                Load
              </AccentUploadButton>
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Use V3 definitions (via/next)</Label>
            <Detail>
              <AccentSlider
                isChecked={definitionVersion === 'v3'}
                onChange={(val) => dispatch(selectVersion(val ? 'v3' : 'v2'))}
              />
            </Detail>
          </ControlRow>
          {definition && (
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
          {definition && (
            <Layouts
              definition={definition}
              onLayoutChange={(newSelectedOptionKeys) => {
                setSelectedOptionKeys(newSelectedOptionKeys);
              }}
            />
          )}
          {definition && (
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
              {Object.values(versionDefinitions).length} Definitions
            </Detail>
          </ControlRow>
          {versionDefinitions.map((definition) => {
            return (
              <IndentedControlRow>
                <SubLabel>{definition[definitionVersion].name}</SubLabel>
                <Detail>
                  0x
                  {definition[definitionVersion].vendorProductId
                    .toString(16)
                    .toUpperCase()}
                </Detail>
              </IndentedControlRow>
            );
          })}
        </Container>
      </OverflowCell>
    </DesignPane>
  );
};
