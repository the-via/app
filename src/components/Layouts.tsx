import * as React from 'react';
import {AccentSelect} from './inputs/accent-select';
import {AccentSlider} from './inputs/accent-slider';
import {Detail, IndentedControlRow, Label} from './panes/grid';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';

interface Props {
  definition: VIADefinitionV2 | VIADefinitionV3;
  onLayoutChange: (newSelectedOptionKeys: number[]) => void;
  RowComponent?: React.ComponentType;
}

function Layouts({
  definition,
  onLayoutChange,
  RowComponent = IndentedControlRow,
}: Props): JSX.Element | null {
  const [selectedOptionKeys, setSelectedOptionKeys] = React.useState<number[]>(
    [],
  );

  React.useEffect(() => {
    setSelectedOptionKeys(() => []);
  }, [definition]);

  React.useEffect(() => {
    onLayoutChange(selectedOptionKeys);
  }, [selectedOptionKeys]);

  if (!definition.layouts.labels) {
    return null;
  }

  const LayoutControls = definition.layouts.labels.map((label, layoutKey) => {
    const optionKeys = definition.layouts.optionKeys[layoutKey];

    // Multiple versions of this layout
    if (Array.isArray(label)) {
      const name = label[0];
      const options = label.slice(1);

      const selectElementOptions = options.map((option, optionIndex) => ({
        label: option,
        value: optionKeys[optionIndex],
      }));

      return (
        <RowComponent key={name}>
          <Label>{name}</Label>
          <Detail>
            <AccentSelect
              onChange={(option) => {
                if (option) {
                  const optionIndex = options.indexOf(option.label);
                  setSelectedOptionKeys((selectedOptions) => {
                    selectedOptions[layoutKey] = optionIndex;
                    return [...selectedOptions];
                  });
                }
              }}
              value={
                selectedOptionKeys[layoutKey]
                  ? selectElementOptions[selectedOptionKeys[layoutKey]]
                  : (selectElementOptions[0] as any)
              }
              options={selectElementOptions as any}
            />
          </Detail>
        </RowComponent>
      );
    }
    if (typeof label === 'string') {
      return (
        <RowComponent key={label}>
          <Label>{label}</Label>
          <Detail>
            <AccentSlider
              isChecked={Boolean(selectedOptionKeys[layoutKey])}
              onChange={(isChecked) => {
                setSelectedOptionKeys((selectedOptions) => {
                  selectedOptions[layoutKey] = Number(isChecked);
                  return [...selectedOptions];
                });
              }}
            />
          </Detail>
        </RowComponent>
      );
    }
    return null;
  });

  return <>{LayoutControls}</>;
}

export default Layouts;
