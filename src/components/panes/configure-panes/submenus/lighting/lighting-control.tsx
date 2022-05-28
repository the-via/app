import React from 'react';
import {AccentSlider} from '../../../../inputs/accent-slider';
import ControlSelect from 'src/components/controls/ControlSelect';
import {AccentRange} from '../../../../inputs/accent-range';
import type {VIADefinitionV2, VIADefinitionV3, LightingValue} from 'via-reader';
import {ArrayColorPicker} from '../../../../inputs/color-picker';
import {useDispatch} from 'react-redux';
import {
  getSelectedLightingData,
  updateBacklightValue,
} from 'src/store/lightingSlice';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedDefinition} from 'src/store/definitionsSlice';

export type ControlMeta = [
  LightingValue,
  string | React.VFC<AdvancedControlProps>,
  {type: string} & Partial<{
    min: number;
    max: number;
    getOptions: (d: VIADefinitionV2 | VIADefinitionV3) => string[];
  }>,
];

type AdvancedControlProps = {meta: ControlMeta};

export const LightingControl = (props: AdvancedControlProps) => {
  const dispatch = useDispatch();
  const lightingData = useAppSelector(getSelectedLightingData);
  const definition = useAppSelector(getSelectedDefinition);
  const [command, label, meta] = props.meta;
  const valArr = lightingData && lightingData[command];
  if (!valArr || !definition) {
    return null;
  }

  const labelContent = typeof label === 'string' ? label : label(props);

  const LightingControlInput = React.useMemo(() => {
    switch (meta.type) {
      case 'slider': {
        return (
          <AccentSlider
            className="justify-self-end"
            isChecked={!!valArr[0]}
            onChange={(val: boolean) =>
              dispatch(updateBacklightValue(command, +val))
            }
          />
        );
      }

      case 'range': {
        return (
          <AccentRange
            max={meta.max}
            min={meta.min}
            defaultValue={valArr[0]}
            onChange={(val) => dispatch(updateBacklightValue(command, val))}
          />
        );
      }

      case 'color': {
        return (
          <ArrayColorPicker
            color={valArr as [number, number]}
            setColor={(hue, sat) =>
              dispatch(updateBacklightValue(command, hue, sat))
            }
          />
        );
      }

      case 'select': {
        const options =
          meta.getOptions?.(definition).map((label, value) => ({
            value,
            label,
          })) ?? [];

        return (
          <ControlSelect
            defaultValue={valArr[0]}
            onChange={(selectedValue) => {
              dispatch(updateBacklightValue(command, +selectedValue));
            }}
            options={options}
          />
        );
      }
      case 'row_col': {
        return (
          <AccentSlider
            isChecked={valArr[0] !== 255}
            onChange={(val) => {
              const args = val ? [254, 254] : [255, 255];
              dispatch(updateBacklightValue(command, ...args));
            }}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [command, meta]);

  if (!LightingControlInput) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <div className="font-medium">{labelContent}</div>
      {LightingControlInput}
    </div>
  );
};
