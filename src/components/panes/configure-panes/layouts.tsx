import React from 'react';
import styled from 'styled-components';
import {title, component} from '../../icons/layouts';
import {ControlRow, OverflowCell, Label, Detail} from '../grid';
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
    const options = optionLabels.map((label, idx) => ({
      label,
      value: `${idx}`,
    }));
    return (
      <div className="flex items-center gap-6">
        <ControlLabel>{label}</ControlLabel>
        {optionLabels.map((option, i) => {
          return (
            <ControlButton
              isSelected={selectedOption === i}
              key={option}
              onClick={() => onChange(i)}
            >
              {option}
            </ControlButton>
          );
        })}
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

export const Pane: FC = () => {
  const dispatch = useDispatch();

  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);

  if (!selectedDefinition || !selectedLayoutOptions) {
    return null;
  }

  const {layouts} = selectedDefinition;

  const labels = layouts.labels || [];

  return (
    <div className="m-3">
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
