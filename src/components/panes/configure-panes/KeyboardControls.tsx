import React from 'react';
import {LayerControl} from './layer-control';
import ConfigControl from './ConfigControl';
import {
  getDeviceDimensions,
  getScaleTransform,
} from 'src/components/positioned-keyboard';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';

interface ConfigureKeyboardControlsProps
  extends React.HTMLProps<HTMLDivElement> {
  dimensions: {
    height: number;
    width: number;
  };
}

export default function ConfigureKeyboardControls(
  props: ConfigureKeyboardControlsProps,
) {
  const {dimensions} = props;
  const selectedDefinition = useAppSelector(getSelectedDefinition);

  const {width} = (selectedDefinition as VIADefinitionV2 | VIADefinitionV3)
    .layouts;

  const styleWidth = React.useMemo(() => {
    const scaleTransform = getScaleTransform(dimensions, width);
    const [_, frameWidth] = getDeviceDimensions(undefined, width);

    // The same width set for the positioned keyboard above
    return `${frameWidth * scaleTransform}px`;
  }, [dimensions, width]);

  return (
    <div
      className="flex justify-between mx-auto"
      style={{
        width: styleWidth,
      }}
    >
      <LayerControl />
      <ConfigControl />
    </div>
  );
}
