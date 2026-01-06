import {RootState} from './index';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DeviceInfo} from 'src/types/types';

export type KeyboardAPIError = {
  commandName: string;
  commandBytes: number[];
  responseBytes: number[];
  deviceInfo: DeviceInfo;
};

export type AppError = {
  timestamp: string;
  message: string;
  deviceInfo: DeviceInfo;
  isPotentiallyUserFixable?: boolean;
  userFix?: () => JSX.Element | undefined;
};

export const extractDeviceInfo = (device: DeviceInfo): DeviceInfo => ({
  productId: device.productId,
  vendorId: device.vendorId,
  productName: device.productName,
  protocol: device.protocol,
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

export const extractMessageFromKeyboardAPIError = (error: KeyboardAPIError) =>
  `Command Name: ${error.commandName}
Command: ${formatBytes(error.commandBytes)}
Response: ${formatBytes(error.responseBytes)}`;
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
    logKeyboardAPIError: (state, action: PayloadAction<KeyboardAPIError>) => {
      const {deviceInfo} = action.payload;
      state.appErrors.push({
        timestamp: getErrorTimestamp(),
        message: extractMessageFromKeyboardAPIError(action.payload),
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
