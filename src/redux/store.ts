import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { baseApi } from './api/vfr3d/vfr3dSlice';
import airportsReducer from './slices/airportsSlice';
import airspacesReducer from './slices/airspacesSlice';
import viewerReducer from './slices/viewerSlice';
import selectedEntityReducer from './slices/selectedEntitySlice';
import routeStyleReducer from './slices/routeStyleSlice';
import sidebarReducer from './slices/sidebarSlice';
import searchReducer from './slices/searchSlice';
import pirepsReducer from './slices/pirepsSlice';
import airsigmetsReducer from './slices/airsigmetsSlice';
import flightPlanningReducer from './slices/flightPlanningSlice';
import obstaclesReducer from './slices/obstaclesSlice';

// Combine all reducers
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  airport: airportsReducer,
  airspaces: airspacesReducer,
  viewer: viewerReducer,
  selectedEntity: selectedEntityReducer,
  routeStyle: routeStyleReducer,
  sidebar: sidebarReducer,
  search: searchReducer,
  pireps: pirepsReducer,
  airsigmet: airsigmetsReducer,
  flightPlanning: flightPlanningReducer,
  obstacles: obstaclesReducer,
});

// Persist configuration
const persistConfig = {
  key: 'vfr3d-root',
  version: 1,
  storage,
  whitelist: ['flightPlanning', 'viewer', 'routeStyle', 'airport'],
  blacklist: [baseApi.reducerPath],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Create persistor
export const persistor = persistStore(store);

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
