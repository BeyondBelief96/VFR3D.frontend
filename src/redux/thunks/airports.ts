import { createAsyncThunk } from '@reduxjs/toolkit';
import { airportsApi } from '../api/vfr3d/airports.api';

export const fetchAirportByCode = createAsyncThunk(
  'data/fetchAirportByCode',
  async (code: string, { dispatch }) => {
    if (code.length >= 3 && code.length <= 4) {
      const { data: airport } = await dispatch(
        airportsApi.endpoints.getAirportByIcaoCodeOrIdent.initiate(code)
      );
      return airport;
    }
  }
);

export const fetchAdditionalAirports = createAsyncThunk(
  'data/fetchAdditionalAirports',
  async (icaoIdOrArptId: string, { getState, dispatch }) => {
    const state = getState() as { baseApi: unknown };
    const existingData = airportsApi.endpoints.getAllAirports.select(icaoIdOrArptId)(
      state as never
    );
    if (!existingData.isSuccess) {
      const response = await dispatch(
        airportsApi.endpoints.getAllAirports.initiate(icaoIdOrArptId)
      );
      return response.data;
    }
    return existingData;
  }
);
