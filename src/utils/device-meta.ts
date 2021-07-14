import {Component} from 'react';
import {ParsedKLE} from './kle-parser';

const enum LightingSupport {
  None,
  QMKLighting,
  WTRGBBacklight,
  WTMonoBacklight
}

export type CustomMenu = {title: string; component: typeof Component};

export type DeviceMeta = {
  name: string;
  layout: string;
  matrixLayout: string;
  lights: LightingSupport;
  overrideMatrixIndexing?: boolean;
  customMenus?: CustomMenu[];
  vendorProductId: number;
};

export type CompiledDeviceMeta = DeviceMeta & {
  compiledLayout: ParsedKLE;
  compiledMatrixLayout: any;
};
