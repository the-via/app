import React, {useMemo} from 'react';
import cntl from 'cntl';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getNumberOfLayers,
  getSelectedLayerIndex,
  setLayer,
} from 'src/store/keymapSlice';
import styled from 'styled-components';
import ControlLabel from 'src/components/controls/ControlLabel';
import ControlButton from 'src/components/controls/ControlButton';

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
const LayerButtonOld = styled.button<{selected?: boolean}>`
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

interface LayerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
}

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
          <ControlButton
            key={layerLabel}
            isSelected={layerLabel === selectedLayerIndex}
            onClick={() => dispatch(setLayer(layerLabel))}
          >
            {layerLabel}
          </ControlButton>
        )),
    [numberOfLayers, selectedLayerIndex],
  );

  return (
    <div className="flex items-center">
      <ControlLabel>Layer</ControlLabel>
      <div className="flex gap-2">{Layers}</div>
    </div>
  );
};
