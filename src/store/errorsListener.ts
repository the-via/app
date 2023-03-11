import {createListenerMiddleware} from '@reduxjs/toolkit';
import {
  extractMessageFromKeyboardAPIError,
  logAppError,
  logKeyboardAPIError,
} from './errorsSlice';
import * as Sentry from '@sentry/react';
import {formatNumberAsHex} from 'src/utils/format';
import {DeviceInfo} from 'src/types/types';

export const errorsListenerMiddleware = createListenerMiddleware();

const captureError = (message: string, deviceInfo: DeviceInfo) => {
  Sentry.captureException(new Error(message), {
    tags: {
      productName: deviceInfo.productName,
      vendorId: formatNumberAsHex(deviceInfo.vendorId, 4),
    },
    extra: {
      deviceInfo: deviceInfo,
    },
  });
};

errorsListenerMiddleware.startListening({
  actionCreator: logAppError,
  effect: async ({payload: {message, deviceInfo}}, listenerApi) => {
    captureError(message, deviceInfo);
  },
});

errorsListenerMiddleware.startListening({
  actionCreator: logKeyboardAPIError,
  effect: async ({payload}, listenerApi) => {
    captureError(
      extractMessageFromKeyboardAPIError(payload),
      payload.deviceInfo,
    );
  },
});
