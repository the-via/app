import React from 'react';
import type {FC} from 'react';
import {ColorPicker} from '../../../../inputs/color-picker';
import {ControlRow, Label, Detail} from '../../../grid';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  LightingValue,
  VIADefinitionV2,
  VIADefinitionV3,
} from '@the-via/reader';
import {LightingControl} from './lighting-control';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getSelectedLightingData,
  updateBacklightValue,
  updateCustomColor,
} from 'src/store/lightingSlice';
import {getSelectedDefinition} from 'src/store/definitionsSlice';

const BacklightControls: [
  LightingValue,
  string,
  {type: string} & Record<string, any>,
][] = [
  [
    LightingValue.BACKLIGHT_BRIGHTNESS,
    'Brightness',
    {type: 'range', min: 0, max: 255},
  ],
  [
    LightingValue.BACKLIGHT_EFFECT,
    'Effect',
    {
      type: 'select',
      getOptions: (definition: VIADefinitionV2 | VIADefinitionV3) =>
        isVIADefinitionV2(definition) &&
        getLightingDefinition(definition.lighting).effects.map(
          ([label]) => label,
        ),
    },
  ],
  [
    LightingValue.BACKLIGHT_EFFECT_SPEED,
    'Effect Speed',
    {type: 'range', min: 0, max: 3},
  ],
];

const UnderglowControls: [
  LightingValue,
  string,
  {type: string} & Record<string, any>,
][] = [
  [
    LightingValue.QMK_RGBLIGHT_BRIGHTNESS,
    'Underglow Brightness',
    {type: 'range', min: 0, max: 255},
  ],
  [
    LightingValue.QMK_RGBLIGHT_EFFECT,
    'Underglow Effect',
    {
      type: 'select',
      getOptions: (definition: VIADefinitionV2 | VIADefinitionV3) =>
        isVIADefinitionV2(definition) &&
        getLightingDefinition(definition.lighting).underglowEffects.map(
          ([label]) => label,
        ),
    },
  ],
  [
    LightingValue.QMK_RGBLIGHT_EFFECT_SPEED,
    'Underglow Effect Speed',
    {type: 'range', min: 0, max: 3},
  ],
];

export const GeneralPane: FC = () => {
  const dispatch = useAppDispatch();
  const lightingData = useAppSelector(getSelectedLightingData);
  const selectedDefinition = useAppSelector(getSelectedDefinition);

  if (!lightingData) {
    return null;
  }

  if (!isVIADefinitionV2(selectedDefinition)) {
    throw new Error(
      'This lighting component is only compatible with v2 definitions',
    );
  }

  const lightingDefinition = getLightingDefinition(selectedDefinition.lighting);
  const {supportedLightingValues} = lightingDefinition;
  if (lightingDefinition.supportedLightingValues.length !== 0) {
    const colorsNeededArr = lightingDefinition.effects.map(([_, num]) => num);
    const underglowColorsNeededArr = lightingDefinition.underglowEffects.map(
      ([_, num]) => num,
    );
    const currentEffect = lightingData[LightingValue.BACKLIGHT_EFFECT];
    const currentUnderglowEffect =
      lightingData[LightingValue.QMK_RGBLIGHT_EFFECT];
    const colorsNeeded =
      (currentEffect && colorsNeededArr[currentEffect[0]]) || 0;
    const underglowColorNeeded =
      currentUnderglowEffect &&
      underglowColorsNeededArr[currentUnderglowEffect[0]] === 1;
    const useCustomColors = !!lightingData.customColors;
    const showCustomColors = useCustomColors && colorsNeeded > 2;
    return (
      <>
        {BacklightControls.filter(
          (control) => supportedLightingValues.indexOf(control[0]) !== -1,
        ).map((meta: any) => (
          <LightingControl meta={meta} />
        ))}
        {UnderglowControls.filter(
          (control) => supportedLightingValues.indexOf(control[0]) !== -1,
        ).map((meta: any) => (
          <LightingControl meta={meta} />
        ))}
        {new Array(colorsNeeded)
          .fill(1)
          .map((val, idx) => val + idx)
          .map((val) => {
            let color, setColor;
            const command =
              val === 1
                ? LightingValue.BACKLIGHT_COLOR_1
                : LightingValue.BACKLIGHT_COLOR_2;
            const valArr = lightingData[command];
            if (showCustomColors && lightingData.customColors) {
              [color, setColor] = [
                lightingData.customColors[val - 1],
                (hue: number, sat: number) =>
                  dispatch(updateCustomColor(val - 1, hue, sat)),
              ];
            } else if (valArr) {
              [color, setColor] = [
                {
                  hue: valArr[0],
                  sat: valArr[1],
                },
                (hue: number, sat: number) =>
                  dispatch(updateBacklightValue(command, hue, sat)),
              ];
            } else {
              return null;
            }

            return (
              <ControlRow key={val}>
                <Label>Color {val}</Label>
                <Detail>
                  <ColorPicker color={color} setColor={setColor} />
                </Detail>
              </ControlRow>
            );
          })}
        {underglowColorNeeded && (
          <LightingControl
            meta={[
              LightingValue.QMK_RGBLIGHT_COLOR,
              'Underglow Color',
              {type: 'color'},
            ]}
          />
        )}
      </>
    );
  }
  return null;
};
