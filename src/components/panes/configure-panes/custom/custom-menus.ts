import {VIAMenu} from 'via-reader';

export const WTRGBMenu: VIAMenu = {
  label: 'WT Lighting',
  content: [
    {
      label: 'General',
      content: [
        {
          label: 'Brightness',
          type: 'range',
          // bytes?: 1 (default)
          options: [0, 100],
          content: ['brightness', 0x00, 0x09]
        },
        {
          label: 'Effect',
          type: 'dropdown',
          options: [
            ['All Off', 0],
            ['Solid Color 1', 1],
            ['Alphas/Mods Color 1/2', 2],
            ['Gradient Vertical Color 1/2', 2],
            ['Raindrops Color 1/2', 2],
            ['Cycle All', 0],
            ['Cycle Horizontal', 0],
            ['Cycle Vertical', 0],
            ['Jellybean Raindrops', 0],
            ['Radial All Hues', 0],
            ['Radial Color 1', 1]
          ],
          content: ['effect', 0x00, 0x0a]
        },
        {
          label: 'Effect Speed',
          type: 'range',
          options: [0, 3],
          content: ['effect_speed', 0x00, 0x0b]
        },
        {
          showIf: '{effect} != 0',
          content: [
            {
              label: 'Color 1',
              type: 'color',
              content: ['color_1', 0x00, 0x0c]
            }
          ]
        },
        {
          showIf: '{effect} == 2 || {effect} == 3 || {effect} == 4',
          content: [
            {
              label: 'Color 2',
              type: 'color',
              content: ['color_2', 0x00, 0x0d]
            }
          ]
        }
      ]
    },
    {
      label: 'Advanced',
      content: [
        {
          label: 'Disable LEDs when USB is suspended',
          type: 'toggle',
          // options: [0,1] <- optional explicit, defaults to this
          content: ['backlight_disable_when_usb_suspended', 0x00, 0x07]
        },
        {
          label: 'LED Sleep Timeout',
          type: 'range',
          options: [0, 255],
          unit: 'mins',
          content: ['backlight_disable_after_timeout', 0x00, 0x08]
        },
        {
          label: 'Caps Lock indicator',
          type: 'toggle',
          options: [
            [255, 255],
            [254, 254]
          ],
          content: ['backlight_caps_lock_indicator', 0x00, 0x0f]
        },
        {
          label: 'Caps Lock indicator color',
          type: 'color',
          showIf: '{backlight_caps_lock_indicator.0} == 254',
          content: ['backlight_caps_lock_indicator_color', 0x00, 0x0e]
        },
        {
          label: 'Layer 1 indicator',
          type: 'toggle',
          options: [
            [255, 255],
            [254, 254]
          ],
          content: ['backlight_layer_1_indicator', 0x00, 0x11]
        },
        {
          label: 'Layer 1 indicator color',
          type: 'color',
          showIf: '{backlight_caps_lock_indicator.0} == 254',
          content: ['backlight_layer_1_indicator_color', 0x00, 0x10]
        },
        {
          label: 'Layer 2 indicator',
          type: 'toggle',
          options: [
            [255, 255],
            [254, 254]
          ],
          content: ['backlight_layer_1_indicator', 0x00, 0x13]
        },
        {
          label: 'Layer 2 indicator color',
          type: 'color',
          showIf: '{backlight_caps_lock_indicator.0} == 254',
          content: ['backlight_layer_1_indicator_color', 0x00, 0x12]
        },
        {
          label: 'Layer 3 indicator',
          type: 'toggle',
          options: [
            [255, 255],
            [254, 254]
          ],
          content: ['backlight_layer_1_indicator', 0x00, 0x15]
        },
        {
          label: 'Layer 3 indicator color',
          type: 'color',
          showIf: '{backlight_caps_lock_indicator.0} == 254',
          content: ['backlight_layer_1_indicator_color', 0x00, 0x14]
        }
      ]
    }
  ]
};

export const QMKLightingMenu: VIAMenu = {
  label: 'QMK Lighting',
  content: [
    {
      label: 'General',
      content: [
        {
          label: 'Backlight',
          type: 'toggle',
          content: ['backlight', 0x00, 0x0a]
        },
        {
          showIf: '{backlight}',
          label: 'Brightness',
          type: 'range',
          options: [0, 100],
          content: ['brightness', 0x00, 0x09]
        },
        {
          label: 'Underglow effect',
          type: 'dropdown',
          content: ['underglowEffect', 0x00, 0x81],
          options: [
            ['All Off', 0],
            ['Solid Color', 1],
            ['Breathing 1', 1],
            ['Breathing 2', 1],
            ['Breathing 3', 1],
            ['Breathing 4', 1],
            ['Rainbow Mood 1', 0],
            ['Rainbow Mood 2', 0],
            ['Rainbow Mood 3', 0],
            ['Rainbow Swirl 1', 0],
            ['Rainbow Swirl 2', 0],
            ['Rainbow Swirl 3', 0],
            ['Rainbow Swirl 4', 0],
            ['Rainbow Swirl 5', 0],
            ['Rainbow Swirl 6', 0],
            ['Snake 1', 1],
            ['Snake 2', 1],
            ['Snake 3', 1],
            ['Snake 4', 1],
            ['Snake 5', 1],
            ['Snake 6', 1],
            ['Knight 1', 1],
            ['Knight 2', 1],
            ['Knight 3', 1],
            ['Christmas', 1],
            ['Gradient 1', 1],
            ['Gradient 2', 1],
            ['Gradient 3', 1],
            ['Gradient 4', 1],
            ['Gradient 5', 1],
            ['Gradient 6', 1],
            ['Gradient 7', 1],
            ['Gradient 8', 1],
            ['Gradient 9', 1],
            ['Gradient 10', 1],
            ['RGB Test', 1],
            ['Alternating', 1]
          ]
        },
        {
          showIf: '{underglowEffect} != 0',
          content: [
            {
              label: 'Underglow Brightness',
              type: 'range',
              options: [0, 100],
              content: ['underglowBrightness', 0x00, 0x80]
            },
            {
              label: 'Underglow Effect Speed',
              type: 'range',
              options: [0, 3],
              content: ['underglowEffectSpeed', 0x00, 0x82]
            }
          ]
        }
      ]
    }
  ]
};
