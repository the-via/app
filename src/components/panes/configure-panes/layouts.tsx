import React from 'react';
import styled from 'styled-components';
import {title, component} from '../../icons/layouts';
import {ControlRow, OverflowCell, Label, Detail} from '../grid';
import {AccentSlider} from '../../inputs/accent-slider';
import {AccentSelect} from '../../inputs/accent-select';
import {CenterPane} from '../pane';
import {
  getSelectedDefinition,
  getSelectedLayoutOptions,
  updateLayoutOption,
} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import {useDispatch} from 'react-redux';
import type {LayoutLabel} from 'via-reader';
import type {FC} from 'react';

const LayoutControl: React.FC<{
  onChange: (val: any) => void;
  meta: {labels: string[]; selectedOption: number};
}> = (props) => {
  const {onChange, meta} = props;
  const {labels, selectedOption} = meta;
  // if (Array.isArray(labels)) {
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
          width={150}
          defaultValue={options[selectedOption]}
          options={options}
          onChange={(option) => {
            if (option) {
              onChange(+option.value);
            }
          }}
        />
      </Detail>
    </ControlRow>
  );
  // TODO: LayoutLabel is of type string | string[], but key is assuming former, meta assuming the latter. Halp
  // TODO: see context in Pane below
  // } else if (typeof labels === 'string') {
  //   return (
  //     <ControlRow>
  //       <Label>{labels}</Label>
  //       <Detail>
  //         <AccentSlider
  //           isChecked={!!selectedOption}
  //           onChange={(val) => onChange(+val)}
  //         />
  //       </Detail>
  //     </ControlRow>
  //   );
  // }
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
  const dispatch = useDispatch();

  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);

  if (!selectedDefinition || !selectedLayoutOptions) {
    return null;
  }

  const {layouts} = selectedDefinition;

  const labels = layouts.labels || [];
  return (
    <OverflowCell>
      <ContainerPane>
        <Container>
          {labels.map((label: LayoutLabel, idx: number) => (
            <LayoutControl
              // TODO: LayoutLabel is of type string | string[], but key is assuming former, meta assuming the latter. Halp
              // key={label}
              key={idx}
              onChange={(val) => dispatch(updateLayoutOption(idx, val))}
              meta={{
                labels: label as string[],
                selectedOption: selectedLayoutOptions[idx],
              }}
            />
          ))}
        </Container>
      </ContainerPane>
    </OverflowCell>
  );
};
export const Title = title;
export const Icon = component;
