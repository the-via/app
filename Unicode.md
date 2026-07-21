# Unicode Support in VIA

This guide explains how to use Unicode keycodes in VIA and configure your QMK firmware to support them.

## Overview

VIA now supports three types of Unicode keycodes through the "Any" keycode feature:

- **UC(hex)** - Basic Unicode (up to U+7FFF)
- **UM(index)** - Unicode Map (full Unicode range via array index)
- **UP(i,j)** - Unicode Pair (lowercase/uppercase switching)

## Prerequisites

### Operating System Configuration

Before using Unicode features, ensure your OS is configured for Unicode input:

- **Windows**: WinCompose or the built-in hex input method
- **macOS**: Unicode Hex Input keyboard layout
- **Linux**: IBus or the Ctrl+Shift+U method

### Firmware Requirements

**Important**: You can only enable ONE of these options at a time. Enabling both `UNICODE_ENABLE` and `UNICODEMAP_ENABLE` will result in compilation errors.

#### For UC() keycodes:
Add to your `rules.mk`:
```makefile
UNICODE_ENABLE = yes
# UNICODEMAP_ENABLE = no  # Must be disabled or omitted
```

Add to your `config.h`:
```c
#define UNICODE_SELECTED_MODES UC_WIN  // or UC_MAC, UC_LNX
```

#### For UM() and UP() keycodes:
Add to your `rules.mk`:
```makefile
UNICODEMAP_ENABLE = yes
# UNICODE_ENABLE = no  # Must be disabled or omitted
```

## Using Unicode in VIA

### Basic Unicode - UC()

1. Click on a key in VIA
2. Click the "Any" button
3. Enter a Unicode keycode:
   - `UC(0x00E4)` - ä (with 0x prefix)
   - `UC(00E4)` - ä (without 0x prefix)

Common examples:
- `UC(0x00A9)` - © (Copyright)
- `UC(0x2764)` - ❤ (Heart)
- `UC(0x03B1)` - α (Greek alpha)
- `UC(0x2318)` - ⌘ (Command)

**Limitation**: UC() only supports characters up to U+7FFF.

### Unicode Map - UM()

For full Unicode support (including emoji), use Unicode Map:

1. Define a `unicode_map` array in your keymap.c:
```c
enum unicode_names {
    EYES,
    FIRE,
    ROCKET,
    HEART,
    SMILE,
    THINK,
    PARTY,
    COOL
};

const uint32_t PROGMEM unicode_map[] = {
    [EYES]   = 0x1F440,  // 👀
    [FIRE]   = 0x1F525,  // 🔥
    [ROCKET] = 0x1F680,  // 🚀
    [HEART]  = 0x2764,   // ❤️
    [SMILE]  = 0x1F604,  // 😄
    [THINK]  = 0x1F914,  // 🤔
    [PARTY]  = 0x1F389,  // 🎉
    [COOL]   = 0x1F60E   // 😎
};
```

2. In VIA, use the index:
   - `UM(0)` - 👀 (eyes)
   - `UM(1)` - 🔥 (fire)
   - `UM(2)` - 🚀 (rocket)

### Unicode Pair - UP()

For characters that have lowercase/uppercase variants:

1. Define pairs in your unicode_map:
```c
enum unicode_names {
    GREEK_LOWER_ALPHA,
    GREEK_UPPER_ALPHA,
    GREEK_LOWER_BETA,
    GREEK_UPPER_BETA
};

const uint32_t PROGMEM unicode_map[] = {
    [GREEK_LOWER_ALPHA] = 0x03B1,  // α
    [GREEK_UPPER_ALPHA] = 0x0391,  // Α
    [GREEK_LOWER_BETA]  = 0x03B2,  // β
    [GREEK_UPPER_BETA]  = 0x0392   // Β
};
```

2. In VIA, use:
   - `UP(0,1)` - α/Α (switches with Shift/Caps Lock)
   - `UP(2,3)` - β/Β

## Complete Example

Here's a complete example for a keymap with emoji support:

```c
// In keymap.c
enum unicode_names {
    // Emoji
    EYES, FIRE, ROCKET, HEART, SMILE, THINK, PARTY, COOL,
    // Greek letters (lowercase, uppercase)
    GR_ALPHA_L, GR_ALPHA_U,
    GR_BETA_L, GR_BETA_U
};

const uint32_t PROGMEM unicode_map[] = {
    // Emoji
    [EYES]      = 0x1F440,  // 👀
    [FIRE]      = 0x1F525,  // 🔥
    [ROCKET]    = 0x1F680,  // 🚀
    [HEART]     = 0x2764,   // ❤️
    [SMILE]     = 0x1F604,  // 😄
    [THINK]     = 0x1F914,  // 🤔
    [PARTY]     = 0x1F389,  // 🎉
    [COOL]      = 0x1F60E,  // 😎
    // Greek pairs
    [GR_ALPHA_L] = 0x03B1,  // α
    [GR_ALPHA_U] = 0x0391,  // Α
    [GR_BETA_L]  = 0x03B2,  // β
    [GR_BETA_U]  = 0x0392   // Β
};
```

Then in VIA:
- `UM(0)` through `UM(7)` for emoji
- `UP(8,9)` for α/Α
- `UP(10,11)` for β/Β

## Troubleshooting

### Characters not appearing
1. Check your OS Unicode input method is enabled
2. Verify firmware has UNICODE_ENABLE or UNICODEMAP_ENABLE
3. Ensure the correct input mode (UC_WIN/UC_MAC/UC_LNX)

### Invalid keycode in VIA
1. For UC(), ensure hex value is ≤ 0x7FFF
2. For UM(), ensure index exists in your unicode_map
3. For UP(), ensure both indices are ≤ 127

### Emoji showing as boxes
- Your application/font may not support emoji
- Try in a modern browser or text editor

## Legacy Aliases

VIA also supports legacy aliases:
- `X()` is equivalent to `UM()`
- `XP()` is equivalent to `UP()`

## Resources

- [QMK Unicode Documentation](https://docs.qmk.fm/#/feature_unicode)
- [Unicode Character Table](https://unicode-table.com/)
- [Emoji Unicode List](https://unicode.org/emoji/charts/full-emoji-list.html)