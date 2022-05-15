import React from 'react';
import styled from 'styled-components';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  LightingValue,
} from 'via-reader';
import {LightingControl, ControlMeta} from './lighting-control';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedLightingData} from 'src/store/lightingSlice';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import type {FC} from 'react';
import ControlCategoryLabel from 'src/components/controls/ControlCategoryLabel';

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
  string | React.VFC<any>,
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
    () => {
      const lightingData = useAppSelector(getSelectedLightingData);
      const valArr =
        lightingData &&
        lightingData[LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT];
      if (!valArr) {
        return null;
      }

      return (
        <div>
          LED Sleep Timeout:{' '}
          <div className="font-normal text-sm">
            {!valArr[0] ? 'Never' : `After ${valArr[0]} mins`}
          </div>
        </div>
      );
    },
    {type: 'range', min: 0, max: 255},
  ],
  [
    LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR,
    'Caps Lock Indicator Color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,
    'Caps Lock Indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR,
    'Layer 1 Indicator Color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,
    'Layer 1 Indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR,
    'Layer 2 Indicator Color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,
    'Layer 2 Indicator',
    {type: 'row_col'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR,
    'Layer 3 Indicator Color',
    {type: 'color'},
  ],
  [
    LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL,
    'Layer 3 Indicator',
    {type: 'row_col'},
  ],
];
export const AdvancedPane: FC = () => {
  const lightingData = useAppSelector(getSelectedLightingData);
  const selectedDefinition = useAppSelector(getSelectedDefinition);

  const selectedDefinitionIsVIADefinition = isVIADefinitionV2(selectedDefinition);

  if (!selectedDefinitionIsVIADefinition || !lightingData) {
    return null;
  }

  const {supportedLightingValues} = getLightingDefinition(
    selectedDefinition.lighting,
  );

  return (
    <div className="m-4">
      <ControlCategoryLabel>Advanced</ControlCategoryLabel>
      <div className="flex flex-col gap-8">
        {RGBControls.filter(
          (control) => supportedLightingValues.indexOf(control[0]) !== -1,
        ).map((meta: AdvancedControlMeta) => (
          <LightingControl meta={meta} />
        ))}
      </div>
    </div>
  );
};
