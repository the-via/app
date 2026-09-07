import {KeyboardValue} from './keyboard-values';

type KeyboardValueReader = {
  getKeyboardValue(
    command: KeyboardValue,
    parameters: number[],
    resultLength?: number,
  ): Promise<number[]>;
};

export class KeycodesVersionProtocolError extends Error {
  constructor(
    message: string,
    readonly responseBytes: number[],
  ) {
    super(message);
    this.name = 'KeycodesVersionProtocolError';
  }
}

export class UnsupportedKeycodesVersionError extends KeycodesVersionProtocolError {
  constructor(
    readonly version: number,
    responseBytes: number[],
  ) {
    super(
      'QMK keycode version is not supported by this version of VIA',
      responseBytes,
    );
    this.name = 'UnsupportedKeycodesVersionError';
  }
}

export const MINIMUM_SUPPORTED_KEYCODES_VERSION = 0x00000008;
export const MAXIMUM_SUPPORTED_KEYCODES_VERSION = 0x00000009;

export const formatKeycodesVersion = (version: number) =>
  `0x${version.toString(16).padStart(8, '0')}`;

export const decodeKeycodesVersion = (result: number[]) => {
  if (result.length !== 4) {
    throw new KeycodesVersionProtocolError(
      `Expected 4 version bytes, received ${result.length}`,
      result,
    );
  }
  if (
    result.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 0xff)
  ) {
    throw new KeycodesVersionProtocolError(
      'Version response contains an invalid byte',
      result,
    );
  }

  const version =
    ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>>
    0;
  const isBCD = result.every((byte) => byte >> 4 <= 9 && (byte & 0x0f) <= 9);
  if (version === 0) {
    throw new KeycodesVersionProtocolError(
      'Version response must not be zero',
      result,
    );
  }
  if (!isBCD) {
    throw new KeycodesVersionProtocolError(
      'Version response is not valid BCD',
      result,
    );
  }
  if (
    version < MINIMUM_SUPPORTED_KEYCODES_VERSION ||
    version > MAXIMUM_SUPPORTED_KEYCODES_VERSION
  ) {
    throw new UnsupportedKeycodesVersionError(version, result);
  }
  return version;
};

export const readKeycodesVersion = async (api: KeyboardValueReader) =>
  decodeKeycodesVersion(
    await api.getKeyboardValue(KeyboardValue.KEYCODES_VERSION, [], 4),
  );
