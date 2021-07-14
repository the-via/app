import * as React from 'react';
import styled from 'styled-components';
import {
  getSelectedLayerIndex,
  getNumberOfLayers
} from '../../../redux/modules/keymap';
import {actions} from '../../../redux/modules/keymap';
import {RootState} from '../../../redux';
import {connect} from 'react-redux';

type OwnProps = {};

const mapStateToProps = (state: RootState) => ({
  numberOfLayers: getNumberOfLayers(state.keymap),
  selectedLayerIndex: getSelectedLayerIndex(state.keymap)
});

const mapDispatchToProps = {setLayer: actions.setLayer};

const Container = styled.div`
  position: absolute;
  left: 15px;
  top: 10px;
`;
const Label = styled.label`
  font-size: 20px;
  text-transform: uppercase;
  color: var(--color_light-grey);
  margin-right: 8px;
`;
const LayerButton = styled.button`
  outline: none;
  font-variant-numeric: tabular-nums;
  border: none;
  background: ${props =>
    props.selected ? 'var(--color_light-grey)' : 'transparent'};
  color: ${props =>
    props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  cursor: pointer;
  font-size: 20px;
  &:hover {
    border: none;
    background: ${props =>
      props.selected ? 'var(--color_light-grey)' : 'var(--color_dark-grey)'};
    color: ${props =>
      props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  }
`;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

export class LayerControlComponent extends React.Component<Props> {
  get minLayer() {
    return 0;
  }

  get maxLayer() {
    return this.props.numberOfLayers - 1;
  }

  render() {
    const {selectedLayerIndex, setLayer, numberOfLayers} = this.props;

    const Layers = new Array(numberOfLayers)
      .fill(0)
      .map((val, idx) => idx)
      .map(layerLabel => (
        <LayerButton
          key={layerLabel}
          selected={layerLabel === selectedLayerIndex}
          onClick={() => setLayer(layerLabel)}
        >
          {layerLabel}
        </LayerButton>
      ));
    return (
      <Container>
        <Label>Layer</Label>
        {Layers}
      </Container>
    );
  }
}

export const LayerControl = connect(
  mapStateToProps,
  mapDispatchToProps
)(LayerControlComponent);
