import React from 'react';
import {PelpiKeycodeInput} from '../../../inputs/pelpi/keycode-input';
import {AccentSlider} from '../../../inputs/accent-slider';
import {AccentSelect} from '../../../inputs/accent-select';
import {AccentRange} from '../../../inputs/accent-range';
import {ControlRow, Label, Detail} from '../../grid';
import type {
  VIADefinitionV2,
  VIADefinitionV3,
  VIAItem
} from '@the-via/reader';
import type {LightingData} from '../../../../types/types';
import {ArrayColorPicker} from '../../../inputs/color-picker';
import {ConnectedColorPalettePicker} from 'src/components/inputs/color-palette-picker';
import {shiftFrom16Bit, shiftTo16Bit} from 'src/utils/keyboard-api';

type Props = {
  lightingData: LightingData;
  definition: VIADefinitionV2 | VIADefinitionV3;
};

export type ControlMeta = [
  string | React.VFC<AdvancedControlProps>,
  {type: string} & Partial<{
    min: number;
    max: number;
    getOptions: (d: VIADefinitionV2 | VIADefinitionV3) => string[];
  }>,
];

type AdvancedControlProps = Props & {meta: ControlMeta};

export const VIACustomItem = React.memo(
  (props: VIACustomControlProps & { _id: string}) => (
    <ControlRow id={props._id}>
      <Label>{props.label}</Label>
      <Detail>
        {'type' in props ? (
          <VIACustomControl
            {...props}
            value={props.value && Array.from(props.value)}
          />
        ) : (
          props.content
        )}
      </Detail>
    </ControlRow>
  ),
);

type ControlGetSet = {
  value: number[];
  updateValue: (name: string, ...command: number[]) => void;
};

type VIACustomControlProps = VIAItem & ControlGetSet;

const boxOrArr = <N extends any>(elem: N | N[]) =>
  Array.isArray(elem) ? elem : [elem];

// we can compare value against option[1], that way corrupted values are false
const valueIsChecked = (option: number | number[], value: number[]) =>
  boxOrArr(option).every((o, i) => o == value[i]);

const getRangeValue = (value: number[], max: number) => {
  if (max > 255) {
    return shiftTo16Bit([value[0], value[1]]);
  } else {
    return value[0];
  }
};

const getRangeBytes = (value: number, max: number) => {
  if (max > 255) {
    return shiftFrom16Bit(value);
  } else {
    return [value];
  }
};

export const VIACustomControl = (props: VIACustomControlProps) => {
  const {content, type, options, value} = props as any;
  const [name, ...command] = content;
  switch (type) {
    case 'range': {
      return (
        <AccentRange
          min={options[0]}
          max={options[1]}
          defaultValue={getRangeValue(props.value, options[1])}
          onChange={(val: number) =>
            props.updateValue(
              name,
              ...command,
              ...getRangeBytes(val, options[1]),
            )
          }
        />
      );
    }
    case 'keycode': {
      return (
        <PelpiKeycodeInput
          value={shiftTo16Bit([props.value[0], props.value[1]])}
          meta={{}}
          setValue={(val: number) =>
            props.updateValue(name, ...command, ...shiftFrom16Bit(val))
          }
        />
      );
    }
    case 'toggle': {
      const toggleOptions: any[] = options || [0, 1];
      return (
        <AccentSlider
          isChecked={valueIsChecked(toggleOptions[1], props.value)}
          onChange={(val) =>
            props.updateValue(
              name,
              ...command,
              ...boxOrArr(toggleOptions[+val]),
            )
          }
        />
      );
    }
    case 'dropdown': {
      const selectOptions = options.map(
        (option: [string, number] | string, idx: number) => {
          const [label, value] =
            typeof option === 'string' ? [option, idx] : option;
          return {
            value: value || idx,
            label,
          };
        },
      );
      return (
        <AccentSelect
          /*width={250}*/
          onChange={(option: any) =>
            option && props.updateValue(name, ...command, +option.value)
          }
          options={selectOptions}
          defaultValue={selectOptions.find((p: any) => value[0] === p.value)}
        />
      );
    }
    case 'color': {
      return (
        <ArrayColorPicker
          color={props.value as [number, number]}
          setColor={(hue, sat) => props.updateValue(name, ...command, hue, sat)}
        />
      );
    }
    case 'color-palette': {
      return <ConnectedColorPalettePicker />;
    }
  }
  return null;
};
