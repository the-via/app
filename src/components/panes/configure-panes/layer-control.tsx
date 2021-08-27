import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getNumberOfLayers,
  getSelectedLayerIndex,
  setLayer,
} from 'src/store/keymapSlice';
import styled from 'styled-components';

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
const LayerButton = styled.button<{selected?: boolean}>`
  outline: none;
  font-variant-numeric: tabular-nums;
  border: none;
  background: ${(props) =>
    props.selected ? 'var(--color_light-grey)' : 'transparent'};
  color: ${(props) =>
    props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  cursor: pointer;
  font-size: 20px;
  &:hover {
    border: none;
    background: ${(props) =>
      props.selected ? 'var(--color_light-grey)' : 'var(--color_dark-grey)'};
    color: ${(props) =>
      props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  }
`;

export const LayerControl = () => {
  const dispatch = useDispatch();
  const numberOfLayers = useAppSelector((state) => getNumberOfLayers(state));
  const selectedLayerIndex = useAppSelector((state) =>
    getSelectedLayerIndex(state),
  );

  const Layers = new Array(numberOfLayers)
    .fill(0)
    .map((_, idx) => idx)
    .map((layerLabel) => (
      <LayerButton
        key={layerLabel}
        selected={layerLabel === selectedLayerIndex}
        onClick={() => dispatch(setLayer(layerLabel))}
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
};
