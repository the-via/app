import React from 'react';
import {title, component} from '../../icons/layouts';
import {ControlRow, Label, Detail} from '../grid';
import {AccentSlider} from '../../inputs/accent-slider';
import {
  getSelectedDefinition,
  getSelectedLayoutOptions,
  updateLayoutOption,
} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import {useDispatch} from 'react-redux';
import type {LayoutLabel} from 'via-reader';
import { AccentSelect } from 'src/components/inputs/accent-select';

const LayoutControl: React.VFC<{
  onChange: (val: any) => void;
  meta: {labels: LayoutLabel; selectedOption: number};
}> = (props) => {
  const {onChange, meta} = props;
  const {labels, selectedOption} = meta;


  if (Array.isArray(labels)) {
    const [label, ...optionLabels] = labels;
    const options = optionLabels.map((option) => ({
      label: option,
      value: option
    }));
    return (
      <div className="flex gap-4 items-center">
        <div className="font-semibold w-1/2">{label}</div>
        <AccentSelect
          initialSelectedItem={options[selectedOption]}
          onChange={onChange}
          options={options}
        />
      </div>
    );
  } else {
    return (
      <ControlRow>
        <Label>{labels}</Label>
        <Detail>
          <AccentSlider
            isChecked={!!selectedOption}
            onChange={(val) => onChange(+val)}
          />
        </Detail>
      </ControlRow>
    );
  }
};

export default function LayoutPane() {
  const dispatch = useDispatch();

  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);

  if (!selectedDefinition || !selectedLayoutOptions) {
    return null;
  }

  const {layouts} = selectedDefinition;

  const labels = layouts.labels || [];

  return (
    <div className="p-3 flex flex-col gap-6 overflow-y-auto">
      {labels.map((label: LayoutLabel, idx: number) => (
        <LayoutControl
          key={idx}
          onChange={(val) => dispatch(updateLayoutOption(idx, val))}
          meta={{
            labels: label,
            selectedOption: selectedLayoutOptions[idx],
          }}
        />
      ))}
    </div>
  );
};
export const Title = title;
export const Icon = component;
