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
import ControlLabel from 'src/components/controls/ControlLabel';
import ControlButton from 'src/components/controls/ControlButton';
import type {FC} from 'react';

const LayoutControl: React.VFC<{
  onChange: (val: any) => void;
  meta: {labels: LayoutLabel; selectedOption: number};
}> = (props) => {
  const {onChange, meta} = props;
  const {labels, selectedOption} = meta;
  if (Array.isArray(labels)) {
    const [label, ...optionLabels] = labels;
    // const options = optionLabels.map((label, idx) => ({
    //   label,
    //   value: `${idx}`,
    // }));
    return (
      <div className="p-2">
        <div className="flex items-center mb-3">
          <div className="h-px flex-1 bg-secondary" />
          <div className="tracking-label uppercase text-sm font-medium px-4">{label}</div>
          <div className="h-px flex-1 bg-secondary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {optionLabels.map((option, i) => {
            return (
              <div className="flex justify-center">
                <ControlButton
                  isSelected={selectedOption === i}
                  key={option}
                  onClick={() => onChange(i)}
                >
                  {option}
                </ControlButton>
              </div>
            );
          })}
        </div>
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
    <div className="m-3 flex flex-col gap-6">
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
