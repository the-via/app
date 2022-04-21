import React from 'react';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {AccentSelect} from '../../../../inputs/accent-select';
import {AccentRange} from '../../../../inputs/accent-range';
import {ControlRow, Label, Detail} from '../../../grid';
import type {VIADefinitionV2, VIADefinitionV3, LightingValue} from 'via-reader';
import {ArrayColorPicker} from '../../../../inputs/color-picker';
import {useDispatch} from 'react-redux';
import {
  getSelectedLightingData,
  updateBacklightValue,
} from 'src/store/lightingSlice';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import ControlLabel from 'src/components/controls/ControlLabel';

export type ControlMeta = [
  LightingValue,
  string | React.VFC<AdvancedControlProps>,
  {type: string} & Partial<{
    min: number;
    max: number;
    getOptions: (d: VIADefinitionV2 | VIADefinitionV3) => string[];
  }>,
];

interface LabelProps {
  children?: React.ReactNode;
}

function Label(props: LabelProps) {
  return (
    <div className="font-medium text-sm">{props.children}</div>
  );
}

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
  switch (meta.type) {
    case 'slider':
      return (
        <div>
          <ControlLabel>{labelContent}</ControlLabel>
          <Detail>
            <AccentSlider
              isChecked={!!valArr[0]}
              onChange={(val: boolean) =>
                dispatch(updateBacklightValue(command, +val))
              }
            />
          </Detail>
        </div>
      );

    case 'range':
      return (
        <div className="flex justify-between items-center">
          <Label>{labelContent}</Label>
          <Detail>
            <AccentRange
              max={meta.max}
              min={meta.min}
              defaultValue={valArr[0]}
              onChange={(val) => dispatch(updateBacklightValue(command, val))}
            />
          </Detail>
        </div>
      );
    case 'color':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <ArrayColorPicker
              color={valArr as [number, number]}
              setColor={(hue, sat) =>
                dispatch(updateBacklightValue(command, hue, sat))
              }
            />
          </Detail>
        </ControlRow>
      );
    case 'select': {
      const options = ((meta as any).getOptions(definition) as string[]).map(
        (label, value) => ({
          value,
          label,
        }),
      );
      return (
        <div className="flex justify-between items-center">
          <Label>{labelContent}</Label>
          <Detail>
            <AccentSelect
              width={250}
              onChange={(option) => {
                if (option) {
                  dispatch(updateBacklightValue(command, +option.value));
                }
              }}
              options={options as any}
              defaultValue={(options as any).find(
                (p: any) => valArr[0] === p.value,
              )}
            />
          </Detail>
        </div>
      );
    }
    case 'row_col':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <AccentSlider
              isChecked={valArr[0] !== 255}
              onChange={(val) => {
                const args = val ? [254, 254] : [255, 255];
                dispatch(updateBacklightValue(command, ...args));
              }}
            />
          </Detail>
        </ControlRow>
      );
  }
  return null;
};
