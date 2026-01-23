import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface PirepsState {
  showPireps: boolean;
}

const initialState: PirepsState = {
  showPireps: false,
};

const pirepsSlice = createSlice({
  name: 'pireps',
  initialState,
  reducers: {
    toggleShowPireps: (state, action: PayloadAction<boolean>) => {
      state.showPireps = action.payload;
    },
  },
});

export const { toggleShowPireps } = pirepsSlice.actions;

export default pirepsSlice.reducer;
