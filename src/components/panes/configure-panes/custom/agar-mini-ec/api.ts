import type {KeyboardAPI} from 'src/utils/keyboard-api';

export const AGAR_MINI_EC_VENDOR_ID = 0x9d5b;
export const AGAR_MINI_EC_PRODUCT_ID = 0x2509;
export const AGAR_EC_MATRIX_ROWS = 6;
export const AGAR_EC_MATRIX_COLS = 8;

const RAW_COMMAND = 0xfd;
const GET_EC_ADC_COMMAND = 0xa3;
const KEY_MASK_HI_INDEX = 30;
const KEY_MASK_LO_INDEX = 31;

// Known firmware support is read-only ADC polling through 0xfd 0xa3.
// Calibration write commands are unknown until firmware source or protocol
// documentation is available.

export type AgarEcRow = {
  row: number;
  values: number[];
  keyMask: number;
};

export const readAgarEcRow = async (api: KeyboardAPI): Promise<AgarEcRow> => {
  const response = await api.hidCommand(RAW_COMMAND, [GET_EC_ADC_COMMAND]);

  if (response[0] !== RAW_COMMAND || response[1] !== GET_EC_ADC_COMMAND) {
    throw new Error('Unexpected EC ADC response');
  }

  const row = response[2] >> 4;
  if (row < 0 || row >= AGAR_EC_MATRIX_ROWS) {
    throw new Error('Unexpected EC ADC row');
  }

  const values = response.slice(3, 3 + AGAR_EC_MATRIX_COLS);
  if (values.length !== AGAR_EC_MATRIX_COLS) {
    throw new Error('Incomplete EC ADC values');
  }

  const keyMaskHi = response[KEY_MASK_HI_INDEX];
  const keyMaskLo = response[KEY_MASK_LO_INDEX];
  if (keyMaskHi === undefined || keyMaskLo === undefined) {
    throw new Error('Incomplete EC key mask');
  }

  return {
    row,
    values,
    keyMask: (keyMaskHi << 8) | keyMaskLo,
  };
};
