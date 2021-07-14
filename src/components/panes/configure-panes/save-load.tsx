import * as React from 'react';
import {Component} from 'react';
import styled from 'styled-components';
import {writeFileSync} from 'fs';
import {remote} from 'electron';
import stringify from 'json-stringify-pretty-compact';
import {RootState} from '../../../redux';
import {saveMacros} from '../../../redux/modules/macros';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {ErrorMessage, SuccessMessage} from '../../styled';
import {AccentUploadButton} from '../../inputs/accent-upload-button';
import {AccentButton} from '../../inputs/accent-button';
import {
  saveRawKeymapToDevice,
  actions,
  selectConnectedDevice,
  getSelectedDevice,
  getSelectedDefinition,
  reloadConnectedDevices,
  getSelectedRawLayers
} from '../../../redux/modules/keymap';
import {getByteForCode, getCodeForByte} from '../../../utils/key';
import {title, component} from '../../icons/save';
import {CenterPane} from '../pane';
import {Detail, Label, OverflowCell, ControlRow} from '../grid';

type ViaSaveFile = {
  name: string;
  vendorProductId: number;
  layers: number[][];
  macros?: string[];
};

const isViaSaveFile = (obj: any): obj is ViaSaveFile =>
  obj && obj.name && obj.layers && obj.vendorProductId;

type OwnProps = {};

type State = {
  errorMessage: string;
  successMessage: string;
};

const SaveLoadPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const mapStateToProps = (state: RootState) => ({
  macros: state.macros,
  rawLayers: getSelectedRawLayers(state.keymap),
  selectedDefinition: getSelectedDefinition(state.keymap),
  selectedDevice: getSelectedDevice(state.keymap)
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveMacros,
      saveRawKeymapToDevice,
      selectConnectedDevice,
      loadDefinition: actions.loadDefinition,
      reloadConnectedDevices
    },
    dispatch
  );

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

class SaveMenuComponent extends Component<Props, State> {
  input = React.createRef<HTMLInputElement>();

  constructor(props) {
    super(props);

    this.state = {
      errorMessage: undefined,
      successMessage: undefined
    };
  }

  saveLayout = () => {
    const {selectedDefinition, rawLayers, macros} = this.props;
    const {name, vendorProductId} = selectedDefinition;
    const saveFile: ViaSaveFile = {
      name,
      vendorProductId,
      macros: [...macros.expressions],
      layers: rawLayers.map(layer =>
        layer.keymap.map(keyByte => getCodeForByte(keyByte))
      )
    };
    const content = stringify(saveFile);
    const defaultFilename = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    remote.dialog
      .showSaveDialog({
        defaultPath: `*/${defaultFilename}`,
        filters: [{name: 'json', extensions: ['json']}]
      })
      .then(result => {
        const fileName = result.filePath;
        fileName && writeFileSync(fileName, content);
      });
  };

  loadLayout = file => {
    const {
      selectedDevice,
      macros,
      selectedDefinition,
      saveRawKeymapToDevice
    } = this.props;
    this.setState({errorMessage: undefined, successMessage: undefined});
    const reader = new FileReader();

    reader.onabort = () =>
      this.setState({
        errorMessage: 'File reading was cancelled.'
      });
    reader.onerror = () =>
      this.setState({
        errorMessage: 'Failed to read file.'
      });

    reader.onload = async () => {
      const saveFile = JSON.parse(reader.result.toString());
      if (!isViaSaveFile(saveFile)) {
        this.setState({
          errorMessage: 'Could not load file: invalid data.'
        });
        return;
      }

      if (saveFile.vendorProductId !== selectedDefinition.vendorProductId) {
        this.setState({
          errorMessage: `Could not import layout. This file was created for a different keyboard: ${saveFile.name}`
        });
        return;
      }

      if (
        saveFile.layers.findIndex(
          (layer, idx) =>
            layer.length !== this.props.rawLayers[idx].keymap.length
        ) > -1
      ) {
        this.setState({
          errorMessage:
            'Could not import layout: incorrect number of keys in one or more layers.'
        });
        return;
      }

      if (macros.isFeatureSupported && saveFile.macros) {
        if (saveFile.macros.length !== macros.expressions.length) {
          this.setState({
            errorMessage: 'Could not import layout: incorrect number of macros.'
          });
          return;
        }

        this.props.saveMacros(selectedDevice, saveFile.macros);
      }

      const keymap: number[][] = saveFile.layers.map(layer =>
        layer.map(key => getByteForCode(key))
      );

      await saveRawKeymapToDevice(keymap, selectedDevice);

      this.setState({
        successMessage: 'Successfully updated layout!'
      });
    };

    reader.readAsBinaryString(file);
  };

  render() {
    const {errorMessage, successMessage} = this.state;
    return (
      <OverflowCell>
        <SaveLoadPane>
          <Container>
            <ControlRow>
              <Label>Save Current Layout</Label>
              <Detail>
                <AccentButton onClick={this.saveLayout.bind(this)}>
                  Save
                </AccentButton>
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Load Saved Layout</Label>
              <Detail>
                <AccentUploadButton onLoad={this.loadLayout}>
                  Load
                </AccentUploadButton>
              </Detail>
            </ControlRow>
            {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}
            {successMessage ? (
              <SuccessMessage>{successMessage}</SuccessMessage>
            ) : null}
          </Container>
        </SaveLoadPane>
      </OverflowCell>
    );
  }
}

export const Icon = component;
export const Title = title;
export const Pane = connect(
  mapStateToProps,
  mapDispatchToProps
)(SaveMenuComponent);
