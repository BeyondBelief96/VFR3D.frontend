import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  airportQuery: string;
  triggerSearchCount: number;
}

const initialState: SearchState = {
  airportQuery: '',
  triggerSearchCount: 0,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchAirportQuery: (state, action: PayloadAction<string>) => {
      state.airportQuery = action.payload;
    },
    triggerSearch: (state) => {
      state.triggerSearchCount += 1;
    },
  },
});

export const { setSearchAirportQuery, triggerSearch } = searchSlice.actions;

export default searchSlice.reducer;
