import React from 'react';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  LightingValue,
} from 'via-reader';
import {LightingControl, ControlMeta} from './lighting-control';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedLightingData,
  updateBacklightValue,
} from 'src/store/lightingSlice';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import type {FC} from 'react';
import ControlCategoryLabel from 'src/components/controls/ControlCategoryLabel';
import {useDispatch} from 'react-redux';
import {AccentSlider} from 'src/components/inputs/accent-slider';
import {ArrayColorPicker} from 'src/components/inputs/color-picker';

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

type AdvancedControlMeta = [
  LightingValue,
  string | React.VFC<any>,
  {type: string} & Partial<{min?: number; max?: number}>,
];

interface IndicatorControlProps {
  children: React.ReactNode;
  colorCommand: LightingValue;
  indicatorCommand: LightingValue;
}

function IndicatorControl(props: IndicatorControlProps) {
  const {children, colorCommand, indicatorCommand} = props;
  const dispatch = useDispatch();

  const lightingData = useAppSelector(getSelectedLightingData);
  const selectedDefinition = useAppSelector(getSelectedDefinition);

  const colorValues = lightingData?.[colorCommand] as [number, number];
  const indicatorValues = lightingData?.[indicatorCommand];

  if (!colorValues || !indicatorValues || !selectedDefinition) {
    return null;
  }

  const indiciatorEnabled = indicatorValues[0] === 254;

  return (
    <div className="flex gap-4 justify-between items-center">
      <div className="font-medium w-1/2">{children}</div>
      <div className="flex gap-4 items-center">
        {indiciatorEnabled && (
          <ArrayColorPicker
            color={colorValues}
            setColor={(hue, sat) =>
              dispatch(updateBacklightValue(colorCommand, hue, sat))
            }
          />
        )}
        <AccentSlider
          defaultChecked={indiciatorEnabled}
          onChange={(isChecked) => {
            const newIndicatorValues = isChecked ? [254, 254] : [255, 255];
            dispatch(
              updateBacklightValue(indicatorCommand, ...newIndicatorValues),
            );
          }}
        />
      </div>
    </div>
  );
}

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
];
export const AdvancedPane: FC = () => {
  const lightingData = useAppSelector(getSelectedLightingData);
  const selectedDefinition = useAppSelector(getSelectedDefinition);

  const selectedDefinitionIsVIADefinition =
    isVIADefinitionV2(selectedDefinition);

  if (!selectedDefinitionIsVIADefinition || !lightingData) {
    return null;
  }

  const {supportedLightingValues} = getLightingDefinition(
    selectedDefinition.lighting,
  );

  const isCapsLockIndicatorEnabled = supportedLightingValues.includes(
    LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL,
  );

  const isLayer1IndicatorEnabled = supportedLightingValues.includes(
    LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL,
  );

  const isLayer2IndicatorEnabled = supportedLightingValues.includes(
    LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL,
  );

  const isLayer3IndicatorEnabled = supportedLightingValues.includes(
    LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL,
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
        {isCapsLockIndicatorEnabled && (
          <IndicatorControl
            colorCommand={LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR}
            indicatorCommand={
              LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL
            }
          >
            Caps Lock Indicator
          </IndicatorControl>
        )}
        {isLayer1IndicatorEnabled && (
          <IndicatorControl
            colorCommand={LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR}
            indicatorCommand={LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL}
          >
            Layer 1 Indicator
          </IndicatorControl>
        )}
        {isLayer2IndicatorEnabled && (
          <IndicatorControl
            colorCommand={LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR}
            indicatorCommand={LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL}
          >
            Layer 2 Indicator
          </IndicatorControl>
        )}
        {isLayer3IndicatorEnabled && (
          <IndicatorControl
            colorCommand={LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR}
            indicatorCommand={LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL}
          >
            Layer 3 Indicator
          </IndicatorControl>
        )}
      </div>
    </div>
  );
};
