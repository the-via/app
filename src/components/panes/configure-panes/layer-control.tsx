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

function LayerButton(props: LayerButtonProps): JSX.Element {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    border-2
    border-transparent
    font-bold
    hover:border-primary
    px-2
    rounded-md
    transition-button
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'text-secondary' : 'text-primary'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
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
          <LayerButton
            key={layerLabel}
            isSelected={layerLabel === selectedLayerIndex}
            onClick={() => dispatch(setLayer(layerLabel))}
          >
            {layerLabel}
          </LayerButton>
        )),
    [numberOfLayers, selectedLayerIndex],
  );

  return (
    <div className="flex px-4 pt-4 items-center">
      <div className="uppercase tracking-label mr-6">Layer</div>
      <div className="flex gap-3">{Layers}</div>
    </div>
  );
};
