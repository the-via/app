import * as React from 'react';
import styled from 'styled-components';
import {getLightingDefinition, isVIADefinitionV2, LightingValue} from 'via-reader';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';
import {LightingControl, ControlMeta} from './lighting-control';

export const AdvancedLightingValues = [
  LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED,
  LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT,
  LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR,
  LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,
  LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR,
  LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,
  LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR,
  LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,
  LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR,
  LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL,
];

const AccentText = styled.span`
  color: var(--color_accent);
`;

type AdvancedControlMeta = [
  LightingValue,
  string | React.FC<any>,
  {type: string} & Partial<{min?: number; max?: number}>,
];

const RGBControls: ControlMeta[] = [
  [
    LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED,
    'Disable LEDs when USB is suspended',
    {type: 'slider'},
  ],
  [
    LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT,
    ({lightingData}) =>
      ((val) => (
        <span>
          LED Sleep Timeout:{' '}
          <AccentText>{!val ? 'Never' : `After ${val} mins`}</AccentText>
        </span>
      ))(lightingData[LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT][0]),
    {type: 'range', min: 0, max: 255},
  ],
  [
    LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR,
    'Caps Lock indicator color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,
    'Caps Lock indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR,
    'Layer 1 indicator color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,
    'Layer 1 indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR,
    'Layer 2 indicator color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,
    'Layer 2 indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR,
    'Layer 3 indicator color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL,
    'Layer 3 indicator',
    {type: 'row_col'},
  ],
];
export const AdvancedPane: React.FC<{
  lightingData: any;
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3;
  updateBacklightValue: (command: LightingValue, ...values: number[]) => void;
}> = (props) => {
  const {selectedDefinition, lightingData, updateBacklightValue} = props;
  if (isVIADefinitionV2(selectedDefinition) && lightingData) {
    const {supportedLightingValues} = getLightingDefinition(
      selectedDefinition.lighting,
    );
    return (
      <>
        {RGBControls.filter(
          (control) => supportedLightingValues.indexOf(control[0]) !== -1,
        ).map((meta: AdvancedControlMeta) => (
          <LightingControl
            definition={props.selectedDefinition}
            lightingData={lightingData}
            updateBacklightValue={updateBacklightValue}
            meta={meta}
          />
        ))}
      </>
    );
  }
  return null;
};
