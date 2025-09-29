import React from 'react';
import styled from 'styled-components';
import {title, component} from '../../icons/layouts';
import {ControlRow, SpanOverflowCell, Label, Detail} from '../grid';
import {AccentSlider} from '../../inputs/accent-slider';
import {AccentSelect} from '../../inputs/accent-select';
import {CenterPane} from '../pane';
import {
  getSelectedDefinition,
  getSelectedLayoutOptions,
  updateLayoutOption,
} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import type {LayoutLabel} from '@the-via/reader';
import type {FC} from 'react';

const LayoutControl: React.FC<{
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
      <ControlRow>
        <Label>{label}</Label>
        <Detail>
          <AccentSelect
            /*width={150}*/
            value={options[selectedOption]}
            options={options}
            onChange={(option: any) => {
              if (option) {
                onChange(+option.value);
              }
            }}
          />
        </Detail>
      </ControlRow>
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

const ContainerPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

export const Pane: FC = () => {
  const dispatch = useAppDispatch();

  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);

  if (!selectedDefinition || !selectedLayoutOptions) {
    return null;
  }

  const {layouts} = selectedDefinition;

  const labels = layouts.labels || [];
  return (
    <SpanOverflowCell>
      <ContainerPane>
        <Container>
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
        </Container>
      </ContainerPane>
    </SpanOverflowCell>
  );
};
export const Title = title;
export const Icon = component;
