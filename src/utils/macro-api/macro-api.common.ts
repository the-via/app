import type {KeycodeDict} from '../keycode-dict';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export interface IMacroAPI {
  readMacroExpressions(): Promise<string[]>;
  writeMacroExpressions(expressions: string[]): void;
}

// Corresponds to 'magic codes' in qmk sendstring
export enum KeyAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
  Delay = 4, // \x04
}

export const KeyActionPrefix = 1; // \x01
export const DelayTerminator = 124; // '|';
export const MacroTerminator = 0;

export function getByte(keycodeDict: KeycodeDict, keycode: string): number {
  return keycodeDict.keycodes[keycode.toUpperCase()].byte;
}

export function getKeycode(keycodeDict: KeycodeDict, byte: number): string {
  return keycodeDict.byteToKeycode[byte];
}

export function buildKeyActionBytes(
  keycodeDict: KeycodeDict,
  keyaction: KeyAction,
  keycode: string,
) {
  return [KeyActionPrefix, keyaction, getByte(keycodeDict, keycode)];
}
