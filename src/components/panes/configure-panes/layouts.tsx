import * as React from 'react';
import styled from 'styled-components';
import {title, component} from '../../icons/layouts';
import {ControlRow, OverflowCell, Label, Detail} from '../grid';
import {AccentSlider} from '../../inputs/accent-slider';
import {AccentSelect} from '../../inputs/accent-select';
import {CenterPane} from '../pane';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import type {RootState} from '../../../redux';
import {bindActionCreators} from 'redux';
import {
  getSelectedDefinition,
  getSelectedDevicePath,
  getSelectedLayoutOptions,
  updateLayoutOption,
} from '../../../redux/modules/keymap';

const LayoutControl: React.FC<{
  onChange: (val: any) => void;
  meta: {labels: string[]; selectedOption: number};
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
  } else if (typeof labels === 'string') {
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

  return null;
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

const mapStateToProps = (state: RootState) => ({
  selectedDefinition: getSelectedDefinition(state.keymap),
  selectedDevicePath: getSelectedDevicePath(state.keymap),
  selectedLayoutOptions: getSelectedLayoutOptions(state.keymap),
});

const mapDispatchToProps: MapDispatchToPropsFunction<
  any,
  ReturnType<typeof mapStateToProps>
> = (dispatch) => bindActionCreators({updateLayoutOption}, dispatch);

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const LayoutPane = (props: Props) => {
  const layouts = props.selectedDefinition.layouts;
  const options = props.selectedLayoutOptions;
  const labels = layouts.labels || [];
  return (
    <OverflowCell>
      <ContainerPane>
        <Container>
          {labels.map((label: string, idx: number) => (
            <LayoutControl
              {...props}
              key={label}
              onChange={(val) =>
                props.updateLayoutOption(props.selectedDevicePath, idx, val)
              }
              meta={{labels: label, selectedOption: options[idx]}}
            />
          ))}
        </Container>
      </ContainerPane>
    </OverflowCell>
  );
};
export const Title = title;
export const Icon = component;
export const Pane = connect(mapStateToProps, mapDispatchToProps)(LayoutPane);
