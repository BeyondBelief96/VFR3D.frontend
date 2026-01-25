import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SigmetHazardType = 'CONVECTIVE' | 'ICE' | 'TURB' | 'IFR' | 'MTN_OBSCN';

// G-AIRMET hazard types matching the backend enum
export type GAirmetHazardType =
  | 'MT_OBSC'    // Mountain Obscuration (SIERRA)
  | 'IFR'        // IFR conditions (SIERRA)
  | 'TURB_LO'    // Low-level turbulence (TANGO)
  | 'TURB_HI'    // High-level turbulence (TANGO)
  | 'LLWS'       // Low-level wind shear (TANGO)
  | 'SFC_WIND'   // Strong surface winds (TANGO)
  | 'ICE'        // Icing (ZULU)
  | 'FZLVL'      // Freezing level (ZULU)
  | 'M_FZLVL';   // Multiple freezing levels (ZULU)

// Legacy type alias for backwards compatibility
export type HazardType = SigmetHazardType;

interface SigmetHazardVisibility {
  CONVECTIVE: boolean;
  ICE: boolean;
  TURB: boolean;
  IFR: boolean;
  MTN_OBSCN: boolean;
}

interface GAirmetHazardVisibility {
  MT_OBSC: boolean;
  IFR: boolean;
  TURB_LO: boolean;
  TURB_HI: boolean;
  LLWS: boolean;
  SFC_WIND: boolean;
  ICE: boolean;
  FZLVL: boolean;
  M_FZLVL: boolean;
}

interface WeatherAdvisoriesState {
  sigmetHazards: SigmetHazardVisibility;
  gairmetHazards: GAirmetHazardVisibility;
}

const initialState: WeatherAdvisoriesState = {
  sigmetHazards: {
    CONVECTIVE: false,
    ICE: false,
    TURB: false,
    IFR: false,
    MTN_OBSCN: false,
  },
  gairmetHazards: {
    MT_OBSC: false,
    IFR: false,
    TURB_LO: false,
    TURB_HI: false,
    LLWS: false,
    SFC_WIND: false,
    ICE: false,
    FZLVL: false,
    M_FZLVL: false,
  },
};

const airsigmetSlice = createSlice({
  name: 'airsigmet',
  initialState,
  reducers: {
    toggleSigmetHazard: (state, action: PayloadAction<SigmetHazardType>) => {
      state.sigmetHazards[action.payload] = !state.sigmetHazards[action.payload];
    },
    toggleGAirmetHazard: (state, action: PayloadAction<GAirmetHazardType>) => {
      state.gairmetHazards[action.payload] = !state.gairmetHazards[action.payload];
    },
    setSigmetHazardVisibility: (
      state,
      action: PayloadAction<{ hazard: SigmetHazardType; visible: boolean }>
    ) => {
      state.sigmetHazards[action.payload.hazard] = action.payload.visible;
    },
    setGAirmetHazardVisibility: (
      state,
      action: PayloadAction<{ hazard: GAirmetHazardType; visible: boolean }>
    ) => {
      state.gairmetHazards[action.payload.hazard] = action.payload.visible;
    },
    // Legacy action for backwards compatibility
    toggleHazardVisibility: (state, action: PayloadAction<SigmetHazardType>) => {
      state.sigmetHazards[action.payload] = !state.sigmetHazards[action.payload];
    },
  },
});

export const {
  toggleSigmetHazard,
  toggleGAirmetHazard,
  setSigmetHazardVisibility,
  setGAirmetHazardVisibility,
  toggleHazardVisibility,
} = airsigmetSlice.actions;

export default airsigmetSlice.reducer;
