import {createClient} from '@liveblocks/client';
import {createSlice} from '@reduxjs/toolkit';

const apiKey = import.meta.env.VITE_LIVEBLOCKS_API_KEY;
export const client = createClient({
  publicApiKey: apiKey,
});
const initialState = {cursor: {x: 0, y: 0}, others: []};

const liveblocksSlice = createSlice({
  name: 'liveblocks',
  initialState,
  reducers: {
    /* logic will be added here */
    setCursor: (state, action) => {
      state.cursor = action.payload;
    },
  },
});
export const {setCursor} = liveblocksSlice.actions;

export default liveblocksSlice.reducer;
