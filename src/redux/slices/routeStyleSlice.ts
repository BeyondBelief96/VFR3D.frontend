import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RouteStylesState {
  lineColor: string;
  pointColor: string;
}

const initialState: RouteStylesState = {
  lineColor: 'rgba(0, 255, 255, 1)', // Aqua
  pointColor: 'rgba(255, 0, 255, 1)', // Magenta
};

const routeStylesSlice = createSlice({
  name: 'routeStyles',
  initialState,
  reducers: {
    setLineColor: (state, action: PayloadAction<string>) => {
      state.lineColor = action.payload;
    },
    setEndPointColor: (state, action: PayloadAction<string>) => {
      state.pointColor = action.payload;
    },
  },
});

export const { setLineColor, setEndPointColor } = routeStylesSlice.actions;
export default routeStylesSlice.reducer;
