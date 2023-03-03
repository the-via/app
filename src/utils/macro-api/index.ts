import {getByteToKey} from '../key';
import {getBasicKeyDict} from '../key-to-byte/dictionary-store';
import type {KeyboardAPI} from '../keyboard-api';
import {MacroAPI, validateMacroExpression} from './macro-api';
import {MacroAPIV11, validateMacroExpressionV11} from './macro-api.v11';

export const getMacroAPI = (protocol: number, keyboardApi: KeyboardAPI) => {
  const basicKeyToByte = getBasicKeyDict(protocol);
  const byteToKey = getByteToKey(getBasicKeyDict(protocol));
  return protocol >= 11
    ? new MacroAPIV11(keyboardApi, basicKeyToByte, byteToKey)
    : new MacroAPI(keyboardApi, basicKeyToByte, byteToKey);
};

export const getMacroValidator = (protocol: number) =>
  protocol >= 11 ? validateMacroExpressionV11 : validateMacroExpression;

export const isDelaySupported = (protocol: number) => protocol >= 11;
