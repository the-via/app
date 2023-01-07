import React, {useMemo} from 'react';
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
  font-weight: 400;
  top: 10px;
`;
const Label = styled.label`
  font-size: 20px;
  text-transform: uppercase;
  color: var(--color_label-highlighted);
  margin-right: 6px;
`;
const LayerButton = styled.button<{selected?: boolean}>`
  outline: none;
  font-variant-numeric: tabular-nums;
  border: none;
  background: ${(props) =>
    props.selected ? 'var(--color_accent)' : 'transparent'};
  color: ${(props) =>
    props.selected
      ? 'var(--color_inside-accent)'
      : 'var(--color_label-highlighted)'};
  cursor: pointer;
  font-size: 20px;
  font-weight: 400;
  &:hover {
    border: none;
    background: ${(props) => (props.selected ? 'auto' : 'var(--bg_menu)')};
    color: ${(props) =>
      props.selected ? 'auto' : 'var(--color_label-highlighted)'};
  }
`;

export const LayerControl = () => {
  const dispatch = useDispatch();
  const numberOfLayers = useAppSelector(getNumberOfLayers);
  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);

  const Layers = useMemo(
    () =>
      new Array(numberOfLayers)
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
        )),
    [numberOfLayers, selectedLayerIndex],
  );

  return (
    <Container>
      <Label>Layer</Label>
      {Layers}
    </Container>
  );
};
