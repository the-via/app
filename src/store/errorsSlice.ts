import {RootState} from './index';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DeviceInfo} from 'src/types/types';

export type KeyboardAPIError = {
  timestamp: string;
  commandName: string;
  commandBytes: number[];
  responseBytes: number[];
  deviceInfo: DeviceInfo;
};

export type AppError = {
  timestamp: string;
  message: string;
  deviceInfo: DeviceInfo;
};

export const extractDeviceInfo = (device: DeviceInfo): DeviceInfo => ({
  productId: device.productId,
  vendorId: device.vendorId,
  productName: device.productName,
});

type ErrorsState = {
  appErrors: AppError[];
};

const initialState: ErrorsState = {
  appErrors: [],
};

export const getErrorTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleTimeString([], {hour12: false})}.${now
    .getMilliseconds()
    .toString()
    .padStart(3, '0')}`;
};

export const getMessageFromError = (e: Error) => e.stack || e.message;
const formatBytes = (bytes: number[]) => bytes.join(' ');

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    logAppError: (
      state,
      action: PayloadAction<Omit<AppError, 'timestamp'>>,
    ) => {
      state.appErrors.push({...action.payload, timestamp: getErrorTimestamp()});
    },
    logKeyboardAPIError: (
      state,
      action: PayloadAction<Omit<KeyboardAPIError, 'timestamp'>>,
    ) => {
      const {commandName, commandBytes, responseBytes, deviceInfo} =
        action.payload;
      state.appErrors.push({
        timestamp: getErrorTimestamp(),
        message: `Command Name: ${commandName}
Command: ${formatBytes(commandBytes)}
Response: ${formatBytes(responseBytes)}`,
        deviceInfo,
      });
    },
    clearAppErrors: (state) => {
      state.appErrors = [];
    },
  },
});

export const {logKeyboardAPIError, logAppError, clearAppErrors} =
  errorsSlice.actions;

export default errorsSlice.reducer;

export const getAppErrors = (state: RootState) => state.errors.appErrors;
