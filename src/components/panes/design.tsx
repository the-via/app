import {useState, FC, useRef, Dispatch, DragEvent, useMemo} from 'react';
import {Pane} from './pane';
import styled from 'styled-components';
import {ErrorMessage} from '../styled';
import {AccentSelect} from '../inputs/accent-select';
import {AccentSlider} from '../inputs/accent-slider';
import {AccentUploadButton} from '../inputs/accent-upload-button';
import Layouts from '../Layouts';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBook, faUpload, faXmark} from '@fortawesome/free-solid-svg-icons';
import {
  keyboardDefinitionV2ToVIADefinitionV2,
  isVIADefinitionV2,
  isKeyboardDefinitionV2,
  keyboardDefinitionV3ToVIADefinitionV3,
  isVIADefinitionV3,
  isKeyboardDefinitionV3,
  DefinitionVersionMap,
  VIADefinitionV2,
  VIADefinitionV3,
} from '@the-via/reader';
import type {DefinitionVersion} from '@the-via/reader';
import {
  ControlRow,
  Label,
  SubLabel,
  Detail,
  IndentedControlRow,
  SinglePaneFlexCell,
  Grid,
  SpanOverflowCell,
  MenuCell,
  Row,
  IconContainer,
} from './grid';
import {useDispatch} from 'react-redux';
import {selectDevice, ensureSupportedIds} from 'src/store/devicesSlice';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {useAppSelector} from 'src/store/hooks';
import {
  getCustomDefinitions,
  loadCustomDefinitions,
  storeCustomDefinitions,
  unloadCustomDefinition,
} from 'src/store/definitionsSlice';
import {
  getSelectedDefinitionIndex,
  getSelectedVersion,
  getShowMatrix,
  selectVersion,
  updateSelectedDefinitionIndex,
  updateSelectedOptionKeys,
  updateShowMatrix,
} from 'src/store/designSlice';
import {MenuContainer} from './configure-panes/custom/menu-generator';
import {MenuTooltip} from '../inputs/tooltip';
import {MessageDialog} from '../inputs/message-dialog';
import {IconButtonUnfilledContainer} from '../inputs/icon-button';

let hideDesignWarning = sessionStorage.getItem('hideDesignWarning');

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
  cursor: pointer;
  max-width: 560px;
  border-radius: 6px;
  margin: 50px 10px;
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

const makeReaderPromise = (file: File): Promise<[string, string]> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) return rej();
      res([file.name, reader.result.toString()]);
    };
    reader.onerror = rej;
    reader.onabort = rej;
    reader.readAsBinaryString(file);
  });
};

const isVIADefinition = (
  definition: VIADefinitionV2 | VIADefinitionV3 | null | undefined,
): definition is VIADefinitionV2 | VIADefinitionV3 => {
  return isVIADefinitionV2(definition) || isVIADefinitionV3(definition);
};

// TODO: move this inside function component and then use the closured dispatch?
function importDefinitions(
  files: File[],
  version: DefinitionVersion,
  dispatch: Dispatch<any>,
  setErrors: (errors: string[]) => void,
) {
  Promise.all(files.map(makeReaderPromise)).then((results) => {
    let errors: string[] = [];
    setErrors([]);
    const definitions = results
      .map(([fileName, result]) => {
        if (errors.length > 0) {
          return null;
        }
        try {
          const res = JSON.parse(result.toString());
          const isValid =
            version === 'v2'
              ? isKeyboardDefinitionV2(res) || isVIADefinitionV2(res)
              : isKeyboardDefinitionV3(res) || isVIADefinitionV3(res);
          if (isValid) {
            const definition =
              version === 'v2'
                ? isVIADefinitionV2(res)
                  ? res
                  : keyboardDefinitionV2ToVIADefinitionV2(res)
                : isVIADefinitionV3(res)
                ? res
                : keyboardDefinitionV3ToVIADefinitionV3(res);
            return definition;
          } else {
            errors = (
              version === 'v2'
                ? isKeyboardDefinitionV2.errors ||
                  isVIADefinitionV2.errors ||
                  []
                : isKeyboardDefinitionV3.errors ||
                  isVIADefinitionV3.errors ||
                  []
            ).map(
              (e) =>
                `${fileName} ${e.dataPath ? e.dataPath + ': ' : 'Object: '}${
                  e.message
                }`,
            );
          }
        } catch (err: any) {
          if (err.name) {
            errors.push(`${err.name}: ${err.message}`);
          } else {
            errors.push(`${err}`);
          }
        }
      })
      .filter(isVIADefinition);

    if (errors.length) {
      setErrors(errors);
    } else {
      dispatch(loadCustomDefinitions({definitions, version}));
      dispatch(storeCustomDefinitions({definitions, version}));
      dispatch(
        ensureSupportedIds({
          productIds: definitions.map((d) => d.vendorProductId),
          version,
        }),
      );
      dispatch(selectDevice(null));
      dispatch(reloadConnectedDevices());
    }
  });
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
    const items = Array.from(dataTransfer.items)
      .filter((item) => {
        return item.kind === 'file' && item.type === 'application/json';
      })
      .map((item) => item.getAsFile()) // Use DataTransferItemList interface to access the file(s)
      .filter((item) => item !== null);
    if (items.length) {
      importDefinitions(items as File[], version, dispatch, setErrors);
    }
  }
}

export const DesignTab: FC = () => {
  const dispatch = useDispatch();
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getSelectedVersion);
  const selectedDefinitionIndex = useAppSelector(getSelectedDefinitionIndex);
  const showMatrix = useAppSelector(getShowMatrix);
  const [errors, setErrors] = useState<string[]>([]);
  const versionDefinitions: DefinitionVersionMap[] = useMemo(
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
  const definition =
    versionDefinitions[selectedDefinitionIndex] &&
    versionDefinitions[selectedDefinitionIndex][definitionVersion];
  const uploadButton = useRef<HTMLInputElement>();
  return (
    <DesignPane
      onDragOver={(evt: DragEvent) => {
        evt.dataTransfer.effectAllowed = 'copyMove';
        evt.dataTransfer.dropEffect = 'none';
        evt.preventDefault();
        evt.stopPropagation();
      }}
    >
      <MessageDialog
        isOpen={!hideDesignWarning}
        onClose={() => {
          sessionStorage.setItem('hideDesignWarning', '1');
          hideDesignWarning = '1';
        }}
      >
        This feature is intended for development purposes. If your keyboard is
        not recognized automatically by VIA, please contact your keyboard's
        manufacturer or vendor.
      </MessageDialog>
      <SinglePaneFlexCell ref={flexRef}>
        {!definition && (
          <UploadIcon
            onClick={() => {
              uploadButton.current && uploadButton.current.click();
            }}
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
      </SinglePaneFlexCell>
      <Grid style={{overflow: 'hidden'}}>
        <MenuCell style={{pointerEvents: 'all'}}>
          <MenuContainer>
            <Row $selected={true}>
              <IconContainer>
                <FontAwesomeIcon icon={faBook} />
                <MenuTooltip>Add Definition</MenuTooltip>
              </IconContainer>
            </Row>
          </MenuContainer>
        </MenuCell>
        <SpanOverflowCell>
          <Container>
            <ControlRow>
              <Label>Load Draft Definition</Label>
              <Detail>
                <AccentUploadButton
                  multiple
                  inputRef={uploadButton}
                  onLoad={(files) => {
                    importDefinitions(
                      Array.from(files),
                      definitionVersion,
                      dispatch,
                      setErrors,
                    );
                  }}
                >
                  Load
                </AccentUploadButton>
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Use V2 definitions (deprecated)</Label>
              <Detail>
                <AccentSlider
                  isChecked={definitionVersion === 'v2'}
                  onChange={(val) => dispatch(selectVersion(val ? 'v2' : 'v3'))}
                />
              </Detail>
            </ControlRow>
            {definition && (
              <ControlRow>
                <Label>Shown Keyboard Definition</Label>
                <Detail>
                  <AccentSelect
                    onChange={(option: any) => {
                      // Reset selected layouts when choosing a different
                      // definition
                      dispatch(updateSelectedOptionKeys([]));

                      if (option) {
                        dispatch(updateSelectedDefinitionIndex(+option.value));
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
                  dispatch(updateSelectedOptionKeys(newSelectedOptionKeys));
                }}
              />
            )}
            {definition && (
              <ControlRow>
                <Label>Show Matrix</Label>
                <Detail>
                  <AccentSlider
                    isChecked={showMatrix}
                    onChange={(val) => {
                      dispatch(updateShowMatrix(val));
                    }}
                  />
                </Detail>
              </ControlRow>
            )}
            {errors.map((error: string) => (
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
                <IndentedControlRow
                  key={`${definitionVersion}-${definition[definitionVersion].vendorProductId}`}
                >
                  <SubLabel>{definition[definitionVersion].name}</SubLabel>
                  <Detail>
                    0x
                    {definition[definitionVersion].vendorProductId
                      .toString(16)
                      .padStart(8, '0')
                      .toUpperCase()}
                    <IconButtonUnfilledContainer
                      onClick={() => {
                        dispatch(
                          unloadCustomDefinition({
                            id: definition[definitionVersion].vendorProductId,
                            version: definitionVersion,
                          }),
                        );
                      }}
                      style={{marginLeft: 10, borderRadius: 4}}
                    >
                      <FontAwesomeIcon icon={faXmark} size={'lg'} />
                    </IconButtonUnfilledContainer>
                  </Detail>
                </IndentedControlRow>
              );
            })}
          </Container>
        </SpanOverflowCell>
      </Grid>
    </DesignPane>
  );
};
