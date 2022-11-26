/* VIA PROTOCOL v10 */
/* EXTENDS v9 (i.e. minor version) */
/* Adds custom command get/set/save without breaking changes */
/* Following version will contain breaking changes */

import {KeyboardAPI} from './keyboard-api';

// Based on assumption here: https://github.com/olivia/via-config-private/issues/59
// Will need to update when Wilba creates new protocol
const CUSTOM_COMMAND_GET_VALUE = 0x14;
const CUSTOM_COMMAND_SET_VALUE = 0x15;
const CUSTOM_COMMAND_SAVE = 0x16;

export const VALID_PROTOCOL_VERSIONS = [1, 7, 8, 9, 10, 11];

export class KeyboardAPIV11 extends KeyboardAPI {
  async getCustomValue(
    channelId: number,
    commandId: number,
  ): Promise<number[]> {
    const res = await this.hidCommand(CUSTOM_COMMAND_GET_VALUE, [
      channelId,
      commandId,
    ]);
    return res.slice(1, 2);
  }

  async setCustomValue(
    channelId: number,
    commandId: number,
    ...args: number[]
  ): Promise<void> {
    await this.hidCommand(
      CUSTOM_COMMAND_SET_VALUE,
      [channelId, commandId].concat(args),
    );
  }

  async saveCustomMenuChannel(channelId: number): Promise<void> {
    await this.hidCommand(CUSTOM_COMMAND_SAVE, [channelId]);
  }
}
