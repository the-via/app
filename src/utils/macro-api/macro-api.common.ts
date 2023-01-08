import {KeycodeSequence} from '../use-keycode-recorder';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export interface IMacroAPI {
  readMacroASTS(): Promise<KeycodeSequence[]>;
  readMacroExpressions(): Promise<string[]>;
  writeMacroExpressions(expressions: string[]): void;
}

// Corresponds to 'magic codes' in qmk sendstring
export enum KeyAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
  Delay = 4, // \x04
  CharacterStream = 42, // This is not a real QMK tag, it is implied from the absence of a tag
}

export const KeyActionPrefix = 1; // \x01
export const DelayTerminator = 124; // '|';
export const MacroTerminator = 0;

export function getByte(
  basicKeyToByte: Record<string, number>,
  keycode: string,
): number {
  return basicKeyToByte[keycode.toUpperCase()];
}

export function buildKeyActionBytes(
  basicKeyToByte: Record<string, number>,
  keyaction: KeyAction,
  keycode: string,
) {
  return [KeyActionPrefix, keyaction, getByte(basicKeyToByte, keycode)];
}
