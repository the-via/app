import type {Device, Keymap} from '../types/types';
import type {LightingValue, MatrixInfo} from '@the-via/reader';
import {logCommand} from './command-logger';
import {initAndConnectDevice} from './usb-hid';
import {store} from 'src/store/index';
import {logKeyboardAPIError} from 'src/store/errorsSlice';

// VIA Command IDs

const COMMAND_START = 0x00; // This is really a HID Report ID
const PER_KEY_RGB_CHANNEL_COMMAND = [0, 1];

enum APICommand {
  GET_PROTOCOL_VERSION = 0x01,
  GET_KEYBOARD_VALUE = 0x02,
  SET_KEYBOARD_VALUE = 0x03,
  DYNAMIC_KEYMAP_GET_KEYCODE = 0x04,
  DYNAMIC_KEYMAP_SET_KEYCODE = 0x05,
  //  DYNAMIC_KEYMAP_CLEAR_ALL = 0x06,
  CUSTOM_MENU_SET_VALUE = 0x07,
  CUSTOM_MENU_GET_VALUE = 0x08,
  CUSTOM_MENU_SAVE = 0x09,

  EEPROM_RESET = 0x0a,
  BOOTLOADER_JUMP = 0x0b,
  DYNAMIC_KEYMAP_MACRO_GET_COUNT = 0x0c,
  DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE = 0x0d,
  DYNAMIC_KEYMAP_MACRO_GET_BUFFER = 0x0e,
  DYNAMIC_KEYMAP_MACRO_SET_BUFFER = 0x0f,
  DYNAMIC_KEYMAP_MACRO_RESET = 0x10,
  DYNAMIC_KEYMAP_GET_LAYER_COUNT = 0x11,
  DYNAMIC_KEYMAP_GET_BUFFER = 0x12,
  DYNAMIC_KEYMAP_SET_BUFFER = 0x13,
  DYNAMIC_KEYMAP_GET_ENCODER = 0x14,
  DYNAMIC_KEYMAP_SET_ENCODER = 0x15,

  // DEPRECATED:
  BACKLIGHT_CONFIG_SET_VALUE = 0x07,
  BACKLIGHT_CONFIG_GET_VALUE = 0x08,
  BACKLIGHT_CONFIG_SAVE = 0x09,
}

const APICommandValueToName = Object.entries(APICommand).reduce(
  (acc: any, [key, value]) => ({...acc, [value]: key}),
  {} as Record<APICommand, string>,
);

export enum KeyboardValue {
  UPTIME = 0x01,
  LAYOUT_OPTIONS = 0x02,
  SWITCH_MATRIX_STATE = 0x03,
  FIRMWARE_VERSION = 0x04,
  DEVICE_INDICATION = 0x05,
}

// RGB Backlight Value IDs
// const BACKLIGHT_USE_SPLIT_BACKSPACE = 0x01;
// const BACKLIGHT_USE_SPLIT_LEFT_SHIFT = 0x02;
// const BACKLIGHT_USE_SPLIT_RIGHT_SHIFT = 0x03;
// const BACKLIGHT_USE_7U_SPACEBAR = 0x04;
// const BACKLIGHT_USE_ISO_ENTER = 0x05;
// const BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS = 0x06;
// const BACKLIGHT_DISABLE_WHEN_USB_SUSPENDEd = 0x07;
// const BACKLIGHT_DISABLE_AFTER_TIMEOUT = 0x08;
const BACKLIGHT_BRIGHTNESS = 0x09;
const BACKLIGHT_EFFECT = 0x0a;
// const BACKLIGHT_EFFECT_SPEED = 0x0b;
const BACKLIGHT_COLOR_1 = 0x0c;
const BACKLIGHT_COLOR_2 = 0x0d;
// const BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR = 0x0e;
// const BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_Col = 0x0f;
// const BACKLIGHT_LAYER_1_INDICATOR_COLOR = 0x10;
// const BACKLIGHT_LAYER_1_INDICATOR_ROW_COL = 0x11;
// const BACKLIGHT_LAYER_2_INDICATOR_COLOR = 0x12;
// const BACKLIGHT_LAYER_2_INDICATOR_ROW_COL = 0x13;
// const BACKLIGHT_LAYER_3_INDICATOR_COLOR = 0x14;
// const BACKLIGHT_LAYER_3_INDICATOR_ROW_COL = 0x15;
// const BACKLIGHT_ALPHAS_MODS = 0x16;
const BACKLIGHT_CUSTOM_COLOR = 0x17;

export const PROTOCOL_ALPHA = 7;
export const PROTOCOL_BETA = 8;
export const PROTOCOL_GAMMA = 9;

const cache: {[addr: string]: {hid: any}} = {};

const eqArr = <T>(arr1: T[], arr2: T[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((val, idx) => arr2[idx] === val);
};

export const shiftTo16Bit = ([hi, lo]: [number, number]): number =>
  (hi << 8) | lo;

export const shiftFrom16Bit = (value: number): [number, number] => [
  value >> 8,
  value & 255,
];

const shiftBufferTo16Bit = (buffer: number[]): number[] => {
  const shiftedBuffer = [];
  for (let i = 0; i < buffer.length; i += 2) {
    shiftedBuffer.push(shiftTo16Bit([buffer[i], buffer[i + 1]]));
  }
  return shiftedBuffer;
};

const shiftBufferFrom16Bit = (buffer: number[]): number[] =>
  buffer.map(shiftFrom16Bit).flatMap((value) => value);

type Command = number;
type HIDAddress = string;
type Layer = number;
type Row = number;
type Column = number;
type CommandQueueArgs = [string, number, Array<number>] | (() => Promise<void>);
type CommandQueueEntry = {
  res: (val?: any) => void;
  rej: (error?: any) => void;
  args: CommandQueueArgs;
};
type CommandQueue = Array<CommandQueueEntry>;

const globalCommandQueue: {
  [kbAddr: string]: {isFlushing: boolean; commandQueue: CommandQueue};
} = {};

export const canConnect = (device: Device) => {
  try {
    new KeyboardAPI(device.path);
    return true;
  } catch (e) {
    console.error('Skipped ', device, e);
    return false;
  }
};

export class KeyboardAPI {
  kbAddr: HIDAddress;

  constructor(path: string) {
    this.kbAddr = path;
    if (!cache[path]) {
      const device = initAndConnectDevice({path});
      cache[path] = {hid: device};
    }
  }

  refresh(kbAddr: HIDAddress) {
    this.kbAddr = kbAddr;
    cache[kbAddr] = {
      ...cache[kbAddr],
      hid: initAndConnectDevice({path: kbAddr}),
    };
  }

  async getByteBuffer(): Promise<Uint8Array> {
    return this.getHID().readP();
  }

  async getProtocolVersion() {
    try {
      const [, hi, lo] = await this.hidCommand(APICommand.GET_PROTOCOL_VERSION);
      return shiftTo16Bit([hi, lo]);
    } catch (e) {
      return -1;
    }
  }

  async getKey(layer: Layer, row: Row, col: Column) {
    const buffer = await this.hidCommand(
      APICommand.DYNAMIC_KEYMAP_GET_KEYCODE,
      [layer, row, col],
    );
    return shiftTo16Bit([buffer[4], buffer[5]]);
  }

  async getLayerCount() {
    const version = await this.getProtocolVersion();
    if (version >= PROTOCOL_BETA) {
      const [, count] = await this.hidCommand(
        APICommand.DYNAMIC_KEYMAP_GET_LAYER_COUNT,
      );
      return count;
    }

    return 4;
  }

  async readRawMatrix(matrix: MatrixInfo, layer: number): Promise<Keymap> {
    const version = await this.getProtocolVersion();
    if (version >= PROTOCOL_BETA) {
      return this.fastReadRawMatrix(matrix, layer);
    }
    if (version === PROTOCOL_ALPHA) {
      return this.slowReadRawMatrix(matrix, layer);
    }
    throw new Error('Unsupported protocol version');
  }

  async getKeymapBuffer(offset: number, size: number): Promise<number[]> {
    if (size > 28) {
      throw new Error('Max data length is 28');
    }
    // id_dynamic_keymap_get_buffer <offset> <size> ^<data>
    // offset is 16bit. size is 8bit. data is 16bit keycode values, maximum 28 bytes.
    const res = await this.hidCommand(APICommand.DYNAMIC_KEYMAP_GET_BUFFER, [
      ...shiftFrom16Bit(offset),
      size,
    ]);
    return [...res].slice(4, size + 4);
  }

  async fastReadRawMatrix(
    {rows, cols}: MatrixInfo,
    layer: number,
  ): Promise<number[]> {
    const length = rows * cols;
    const MAX_KEYCODES_PARTIAL = 14;
    const bufferList = new Array<number>(
      Math.ceil(length / MAX_KEYCODES_PARTIAL),
    ).fill(0);
    const {res: promiseRes} = bufferList.reduce(
      ({res, remaining}: {res: Promise<number[]>[]; remaining: number}) =>
        remaining < MAX_KEYCODES_PARTIAL
          ? {
              res: [
                ...res,
                this.getKeymapBuffer(
                  layer * length * 2 + 2 * (length - remaining),
                  remaining * 2,
                ),
              ],
              remaining: 0,
            }
          : {
              res: [
                ...res,
                this.getKeymapBuffer(
                  layer * length * 2 + 2 * (length - remaining),
                  MAX_KEYCODES_PARTIAL * 2,
                ),
              ],
              remaining: remaining - MAX_KEYCODES_PARTIAL,
            },
      {res: [], remaining: length},
    );
    const yieldedRes = await Promise.all(promiseRes);
    return yieldedRes.flatMap(shiftBufferTo16Bit);
  }

  async slowReadRawMatrix(
    {rows, cols}: MatrixInfo,
    layer: number,
  ): Promise<number[]> {
    const length = rows * cols;
    const res = new Array(length)
      .fill(0)
      .map((_, i) => this.getKey(layer, ~~(i / cols), i % cols));
    return Promise.all(res);
  }

  async writeRawMatrix(
    matrixInfo: MatrixInfo,
    keymap: number[][],
  ): Promise<void> {
    const version = await this.getProtocolVersion();
    if (version >= PROTOCOL_BETA) {
      return this.fastWriteRawMatrix(keymap);
    }
    if (version === PROTOCOL_ALPHA) {
      return this.slowWriteRawMatrix(matrixInfo, keymap);
    }
  }

  async slowWriteRawMatrix(
    {cols}: MatrixInfo,
    keymap: number[][],
  ): Promise<void> {
    keymap.forEach(async (layer, layerIdx) =>
      layer.forEach(async (keycode, keyIdx) => {
        await this.setKey(layerIdx, ~~(keyIdx / cols), keyIdx % cols, keycode);
      }),
    );
  }

  async fastWriteRawMatrix(keymap: number[][]): Promise<void> {
    const data = keymap.flatMap((layer) => layer.map((key) => key));
    const shiftedData = shiftBufferFrom16Bit(data);
    const bufferSize = 28;
    for (let offset = 0; offset < shiftedData.length; offset += bufferSize) {
      const buffer = shiftedData.slice(offset, offset + bufferSize);
      await this.hidCommand(APICommand.DYNAMIC_KEYMAP_SET_BUFFER, [
        ...shiftFrom16Bit(offset),
        buffer.length,
        ...buffer,
      ]);
    }
  }

  async getKeyboardValue(
    command: KeyboardValue,
    parameters: number[],
    resultLength = 1,
  ): Promise<number[]> {
    const bytes = [command, ...parameters];
    const res = await this.hidCommand(APICommand.GET_KEYBOARD_VALUE, bytes);
    return res.slice(1 + bytes.length, 1 + bytes.length + resultLength);
  }

  async setKeyboardValue(command: KeyboardValue, ...rest: number[]) {
    const bytes = [command, ...rest];
    await this.hidCommand(APICommand.SET_KEYBOARD_VALUE, bytes);
  }

  async getEncoderValue(
    layer: number,
    id: number,
    isClockwise: boolean,
  ): Promise<number> {
    const bytes = [layer, id, +isClockwise];
    const res = await this.hidCommand(
      APICommand.DYNAMIC_KEYMAP_GET_ENCODER,
      bytes,
    );
    return shiftTo16Bit([res[4], res[5]]);
  }

  async setEncoderValue(
    layer: number,
    id: number,
    isClockwise: boolean,
    keycode: number,
  ): Promise<void> {
    const bytes = [layer, id, +isClockwise, ...shiftFrom16Bit(keycode)];
    await this.hidCommand(APICommand.DYNAMIC_KEYMAP_SET_ENCODER, bytes);
  }

  async getCustomMenuValue(commandBytes: number[]): Promise<number[]> {
    const res = await this.hidCommand(
      APICommand.CUSTOM_MENU_GET_VALUE,
      commandBytes,
    );
    return res.slice(0 + commandBytes.length);
  }

  async setCustomMenuValue(...args: number[]): Promise<void> {
    await this.hidCommand(APICommand.CUSTOM_MENU_SET_VALUE, args);
  }

  async getPerKeyRGBMatrix(ledIndexMapping: number[]): Promise<number[][]> {
    const res = await Promise.all(
      ledIndexMapping.map((ledIndex) =>
        this.hidCommand(APICommand.CUSTOM_MENU_GET_VALUE, [
          ...PER_KEY_RGB_CHANNEL_COMMAND,
          ledIndex,
          1, // count
        ]),
      ),
    );
    return res.map((r) => [...r.slice(5, 7)]);
  }

  async setPerKeyRGBMatrix(
    index: number,
    hue: number,
    sat: number,
  ): Promise<void> {
    await this.hidCommand(APICommand.CUSTOM_MENU_SET_VALUE, [
      ...PER_KEY_RGB_CHANNEL_COMMAND,
      index,
      1, // count
      hue,
      sat,
    ]);
  }

  async getBacklightValue(
    command: LightingValue,
    resultLength = 1,
  ): Promise<number[]> {
    const bytes = [command];
    const res = await this.hidCommand(
      APICommand.BACKLIGHT_CONFIG_GET_VALUE,
      bytes,
    );
    return res.slice(2, 2 + resultLength);
  }

  async setBacklightValue(command: LightingValue, ...rest: number[]) {
    const bytes = [command, ...rest];
    await this.hidCommand(APICommand.BACKLIGHT_CONFIG_SET_VALUE, bytes);
  }

  async getRGBMode() {
    const bytes = [BACKLIGHT_EFFECT];
    const [, , val] = await this.hidCommand(
      APICommand.BACKLIGHT_CONFIG_GET_VALUE,
      bytes,
    );
    return val;
  }

  async getBrightness() {
    const bytes = [BACKLIGHT_BRIGHTNESS];
    const [, , brightness] = await this.hidCommand(
      APICommand.BACKLIGHT_CONFIG_GET_VALUE,
      bytes,
    );
    return brightness;
  }

  async getColor(colorNumber: number) {
    const bytes = [colorNumber === 1 ? BACKLIGHT_COLOR_1 : BACKLIGHT_COLOR_2];
    const [, , hue, sat] = await this.hidCommand(
      APICommand.BACKLIGHT_CONFIG_GET_VALUE,
      bytes,
    );
    return {hue, sat};
  }

  async setColor(colorNumber: number, hue: number, sat: number) {
    const bytes = [
      colorNumber === 1 ? BACKLIGHT_COLOR_1 : BACKLIGHT_COLOR_2,
      hue,
      sat,
    ];
    await this.hidCommand(APICommand.BACKLIGHT_CONFIG_SET_VALUE, bytes);
  }

  async getCustomColor(colorNumber: number) {
    const bytes = [BACKLIGHT_CUSTOM_COLOR, colorNumber];
    const [, , , hue, sat] = await this.hidCommand(
      APICommand.BACKLIGHT_CONFIG_GET_VALUE,
      bytes,
    );
    return {hue, sat};
  }

  async setCustomColor(colorNumber: number, hue: number, sat: number) {
    const bytes = [BACKLIGHT_CUSTOM_COLOR, colorNumber, hue, sat];
    await this.hidCommand(APICommand.BACKLIGHT_CONFIG_SET_VALUE, bytes);
  }

  async setRGBMode(effect: number) {
    const bytes = [BACKLIGHT_EFFECT, effect];
    await this.hidCommand(APICommand.BACKLIGHT_CONFIG_SET_VALUE, bytes);
  }

  async commitCustomMenu(channel: number) {
    await this.hidCommand(APICommand.CUSTOM_MENU_SAVE, [channel]);
  }

  async saveLighting() {
    await this.hidCommand(APICommand.BACKLIGHT_CONFIG_SAVE);
  }

  async resetEEPROM() {
    await this.hidCommand(APICommand.EEPROM_RESET);
  }

  async jumpToBootloader() {
    await this.hidCommand(APICommand.BOOTLOADER_JUMP);
  }

  async setKey(layer: Layer, row: Row, column: Column, val: number) {
    const res = await this.hidCommand(APICommand.DYNAMIC_KEYMAP_SET_KEYCODE, [
      layer,
      row,
      column,
      ...shiftFrom16Bit(val),
    ]);
    return shiftTo16Bit([res[4], res[5]]);
  }

  async getMacroCount() {
    const [, count] = await this.hidCommand(
      APICommand.DYNAMIC_KEYMAP_MACRO_GET_COUNT,
    );
    return count;
  }

  // size is 16 bit
  async getMacroBufferSize() {
    const [, hi, lo] = await this.hidCommand(
      APICommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE,
    );
    return shiftTo16Bit([hi, lo]);
  }

  // From protocol: id_dynamic_keymap_macro_get_buffer <offset> <size> ^<data>
  // offset is 16bit. size is 8bit.
  async getMacroBytes(): Promise<number[]> {
    const macroBufferSize = await this.getMacroBufferSize();
    // Can only get 28 bytes at a time
    const size = 28;
    const bytesP = [];
    for (let offset = 0; offset < macroBufferSize; offset += 28) {
      bytesP.push(
        this.hidCommand(APICommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER, [
          ...shiftFrom16Bit(offset),
          size,
        ]),
      );
    }
    const allBytes = await Promise.all(bytesP);
    return allBytes.flatMap((bytes) => bytes.slice(4));
  }

  // From protocol: id_dynamic_keymap_macro_set_buffer <offset> <size> <data>
  // offset is 16bit. size is 8bit. data is ASCII characters and null (0x00) delimiters/terminator, maximum 28 bytes.
  // async setMacros(macros: Macros[]) {
  async setMacroBytes(data: number[]) {
    const macroBufferSize = await this.getMacroBufferSize();
    const size = data.length;
    if (size > macroBufferSize) {
      throw new Error(
        `Macro size (${size}) exceeds buffer size (${macroBufferSize})`,
      );
    }

    const lastOffset = macroBufferSize - 1;
    const lastOffsetBytes = shiftFrom16Bit(lastOffset);

    // Clear the entire macro buffer before rewriting
    await this.resetMacros();
    try {
      // set last byte in buffer to non-zero (0xFF) to indicate write-in-progress
      await this.hidCommand(APICommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER, [
        ...shiftFrom16Bit(lastOffset),
        1,
        0xff,
      ]);

      // Can only write 28 bytes at a time
      const bufferSize = 28;
      for (let offset = 0; offset < data.length; offset += bufferSize) {
        const buffer = data.slice(offset, offset + bufferSize);
        await this.hidCommand(APICommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER, [
          ...shiftFrom16Bit(offset),
          buffer.length,
          ...buffer,
        ]);
      }
    } finally {
      // set last byte in buffer to zero to indicate write finished
      await this.hidCommand(APICommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER, [
        ...lastOffsetBytes,
        1,
        0x00,
      ]);
    }
  }

  async resetMacros() {
    await this.hidCommand(APICommand.DYNAMIC_KEYMAP_MACRO_RESET);
  }

  get commandQueueWrapper() {
    if (!globalCommandQueue[this.kbAddr]) {
      globalCommandQueue[this.kbAddr] = {isFlushing: false, commandQueue: []};
      return globalCommandQueue[this.kbAddr];
    }
    return globalCommandQueue[this.kbAddr];
  }

  async timeout(time: number) {
    return new Promise((res, rej) => {
      this.commandQueueWrapper.commandQueue.push({
        res,
        rej,
        args: () =>
          new Promise((r) =>
            setTimeout(() => {
              r();
              res(undefined);
            }, time),
          ),
      });
      if (!this.commandQueueWrapper.isFlushing) {
        this.flushQueue();
      }
    });
  }

  async hidCommand(
    command: Command,
    bytes: Array<number> = [],
  ): Promise<number[]> {
    return new Promise((res, rej) => {
      this.commandQueueWrapper.commandQueue.push({
        res,
        rej,
        args: [this.kbAddr, command, bytes],
      });
      if (!this.commandQueueWrapper.isFlushing) {
        this.flushQueue();
      }
    });
  }

  async flushQueue() {
    if (this.commandQueueWrapper.isFlushing === true) {
      return;
    }
    this.commandQueueWrapper.isFlushing = true;
    while (this.commandQueueWrapper.commandQueue.length !== 0) {
      const {res, rej, args} =
        this.commandQueueWrapper.commandQueue.shift() as CommandQueueEntry;
      // This allows us to queue promises in between hid commands, useful for timeouts
      if (typeof args === 'function') {
        await args();
        res();
      } else {
        try {
          const ans = await this._hidCommand(...args);
          res(ans);
        } catch (e) {
          rej(e);
        }
      }
    }
    this.commandQueueWrapper.isFlushing = false;
  }

  getHID() {
    return cache[this.kbAddr].hid;
  }

  async _hidCommand(
    kbAddr: HIDAddress,
    command: Command,
    bytes: Array<number> = [],
  ): Promise<any> {
    const commandBytes = [...[COMMAND_START, command], ...bytes];
    const paddedArray = new Array(33).fill(0);
    commandBytes.forEach((val, idx) => {
      paddedArray[idx] = val;
    });
    try {
      await this.getHID().write(paddedArray);
    } catch (ex) {
      console.log('Retrying...');
      this.refresh(kbAddr);
      this.getHID().write(paddedArray);
    }
    const buffer = Array.from(await this.getByteBuffer());
    const bufferCommandBytes = buffer.slice(0, commandBytes.length - 1);
    logCommand(this.kbAddr, commandBytes, buffer);
    if (!eqArr(commandBytes.slice(1), bufferCommandBytes)) {
      console.error(
        `Command for ${this.kbAddr}:`,
        commandBytes,
        'Bad Resp:',
        buffer,
      );

      const {path, productId, vendorId, productName, usage, usagePage, ...hid} =
        this.getHID();
      const commandName = APICommandValueToName[command];
      const now = new Date();
      const timestamp = `${now.toLocaleTimeString()}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      store.dispatch(
        logKeyboardAPIError({
          timestamp,
          commandName,
          commandBytes: commandBytes.slice(1),
          responseBytes: buffer,
          device: {
            interface: hid.interface,
            path,
            productId,
            vendorId,
            productName,
            usage,
            usagePage,
          },
        }),
      );

      throw new Error('Receiving incorrect response for command');
    }
    console.debug(
      `Command for ${this.kbAddr}`,
      commandBytes,
      'Correct Resp:',
      buffer,
    );
    return buffer;
  }
}
