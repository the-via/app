import type {KeyboardAPI} from '../keyboard-api';
import {MacroAPI, MacroValidator, validateMacroExpression} from './macro-api';
import {MacroAPIV11, validateMacroExpressionV11} from './macro-api.v11';

export const getMacroAPI = (protocol: number, keyboardApi: KeyboardAPI) =>
  protocol >= 11 ? new MacroAPIV11(keyboardApi) : new MacroAPI(keyboardApi);

export const getMacroValidator = (protocol: number): MacroValidator =>
  protocol >= 11 ? validateMacroExpressionV11 : validateMacroExpression;
