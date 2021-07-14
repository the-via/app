import * as React from 'react';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {AccentSelect} from '../../../../inputs/accent-select';
import {AccentRange} from '../../../../inputs/accent-range';
import {ControlRow, Label, Detail} from '../../../grid';
import {VIADefinitionV2, LightingValue} from 'via-reader';
import {LightingData} from '../../../../../types';
import {ArrayColorPicker} from '../../../../inputs/color-picker';
type Props = {
  lightingData: LightingData;
  definition: VIADefinitionV2;
  updateBacklightValue: (command: LightingValue, ...args: number[]) => void;
};

export type ControlMeta = [
  LightingValue,
  string | React.FC<AdvancedControlProps>,
  {type: string} & Partial<{
    min: number;
    max: number;
    getOptions: (d: VIADefinitionV2) => string[];
  }>
];
type AdvancedControlProps = Props & {meta: ControlMeta};
export const LightingControl = (props: AdvancedControlProps) => {
  const [command, label, meta] = props.meta;
  const labelContent = typeof label === 'string' ? label : label(props);
  switch (meta.type) {
    case 'slider':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <AccentSlider
              isChecked={!!props.lightingData[command][0]}
              onChange={val => props.updateBacklightValue(command, +val)}
            />
          </Detail>
        </ControlRow>
      );

    case 'range':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <AccentRange
              max={meta.max}
              min={meta.min}
              defaultValue={props.lightingData[command][0]}
              onChange={val => props.updateBacklightValue(command, val)}
            />
          </Detail>
        </ControlRow>
      );
    case 'color':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <ArrayColorPicker
              color={props.lightingData[command]}
              setColor={(hue, sat) =>
                props.updateBacklightValue(command, hue, sat)
              }
            />
          </Detail>
        </ControlRow>
      );
    case 'select': {
      const options = meta.getOptions(props.definition).map((label, value) => ({
        value,
        label
      }));
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <AccentSelect
              width={250}
              onChange={option =>
                props.updateBacklightValue(command, option.value)
              }
              options={options}
              defaultValue={options.find(
                p => props.lightingData[command][0] === p.value
              )}
            />
          </Detail>
        </ControlRow>
      );
    }
    case 'row_col':
      return (
        <ControlRow>
          <Label>{labelContent}</Label>
          <Detail>
            <AccentSlider
              isChecked={props.lightingData[command][0] !== 255}
              onChange={val => {
                const args = val ? [254, 254] : [255, 255];
                props.updateBacklightValue(command, ...args);
              }}
            />
          </Detail>
        </ControlRow>
      );
  }
  return null;
};
