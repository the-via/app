import {
  KeyboardDefinitionV2,
  KeyboardDefinitionV3,
  KeyboardDictionary,
  keyboardDefinitionV2ToVIADefinitionV2,
  keyboardDefinitionV3ToVIADefinitionV3,
} from '@the-via/reader';
import type {VendorProductIdMap} from 'src/types/types';
import agarMiniEc from './agar-mini-ec.json';

const agarMiniEcV2Definition = agarMiniEc as KeyboardDefinitionV2;

const agarMiniEcV3Definition = {
  name: agarMiniEcV2Definition.name,
  vendorId: agarMiniEcV2Definition.vendorId,
  productId: agarMiniEcV2Definition.productId,
  matrix: agarMiniEcV2Definition.matrix,
  customKeycodes: agarMiniEcV2Definition.customKeycodes,
  layouts: agarMiniEcV2Definition.layouts,
} as KeyboardDefinitionV3;

const agarMiniEcV2 = keyboardDefinitionV2ToVIADefinitionV2(
  agarMiniEcV2Definition,
);
const agarMiniEcV3 = keyboardDefinitionV3ToVIADefinitionV3(
  agarMiniEcV3Definition,
);

export const LOCAL_KEYBOARD_DEFINITIONS: KeyboardDictionary = {
  [agarMiniEcV2.vendorProductId]: {
    v2: agarMiniEcV2,
    v3: agarMiniEcV3,
  },
};

export const LOCAL_SUPPORTED_IDS: VendorProductIdMap = {
  [agarMiniEcV2.vendorProductId]: {
    v2: true,
    v3: true,
  },
};
