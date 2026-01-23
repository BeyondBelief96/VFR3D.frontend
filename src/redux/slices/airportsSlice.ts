import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AirportState {
  showAirportsForSelectedState: boolean;
  showFlightPlanAirports: boolean;
  selectedStateToShowAirports: string;
  searchedAirportState: string;
  showCloudBases: boolean;
}

const initialState: AirportState = {
  showAirportsForSelectedState: false,
  showFlightPlanAirports: true,
  selectedStateToShowAirports: '',
  searchedAirportState: '',
  showCloudBases: true,
};

const airportSlice = createSlice({
  name: 'airport',
  initialState,
  reducers: {
    toggleShowAirports: (state) => {
      state.showAirportsForSelectedState = !state.showAirportsForSelectedState;
    },
    setShowSelectedStateAirports: (state, action: PayloadAction<boolean>) => {
      state.showAirportsForSelectedState = action.payload;
    },
    setShowFlightPlanAirports: (state, action: PayloadAction<boolean>) => {
      state.showFlightPlanAirports = action.payload;
    },
    setSelectedState: (state, action: PayloadAction<string>) => {
      state.selectedStateToShowAirports = action.payload;
    },
    setSearchedAirportState: (state, action: PayloadAction<string>) => {
      state.searchedAirportState = action.payload;
    },
    setShowCloudBases: (state, action: PayloadAction<boolean>) => {
      state.showCloudBases = action.payload;
    },
  },
});

export const {
  setShowSelectedStateAirports,
  setShowFlightPlanAirports,
  setShowCloudBases,
  toggleShowAirports,
  setSelectedState,
  setSearchedAirportState,
} = airportSlice.actions;

export default airportSlice.reducer;
