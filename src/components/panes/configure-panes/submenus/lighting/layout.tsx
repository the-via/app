import * as React from 'react';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {getLightingDefinition, LightingValue} from 'via-reader';

export const LayoutConfigValues = [
  LightingValue.BACKLIGHT_USE_7U_SPACEBAR,
  LightingValue.BACKLIGHT_USE_ISO_ENTER,
  LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE,
  LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT,
  LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT,
  LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS
];

const BooleanControls: [LightingValue, string][] = [
  [LightingValue.BACKLIGHT_USE_7U_SPACEBAR, 'Use 7U Spacebar LEDs'],
  [LightingValue.BACKLIGHT_USE_ISO_ENTER, 'Use ISO Enter LEDs'],
  [LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE, 'Use Split Backspace LEDs'],
  [LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT, 'Use Split Left Shift LEDs'],
  [LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT, 'Use Split Right Shift LEDs'],
  [
    LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS,
    'Disable HHKB Blocker LEDs'
  ]
];

export const LayoutPane = props => {
  const {selectedDefinition, updateBacklightValue, lightingData} = props;
  const lightingDefinition = getLightingDefinition(selectedDefinition.lighting);
  if (lightingDefinition.supportedLightingValues.length !== 0) {
    const controls = BooleanControls.filter(
      control =>
        lightingDefinition.supportedLightingValues.indexOf(control[0]) !== -1
    );

    return (
      <>
        {controls.map(([command, label]) => (
          <ControlRow key={command}>
            <Label>{label}</Label>
            <Detail>
              <AccentSlider
                isChecked={!!lightingData[command][0]}
                onChange={val => updateBacklightValue(command, +val)}
              />
            </Detail>
          </ControlRow>
        ))}
      </>
    );
  }
  return null;
};
