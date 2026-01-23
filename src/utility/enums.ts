export enum WeatherFlightCategories {
  VFR = 'VFR',
  MVFR = 'MVFR',
  IFR = 'IFR',
  LIFR = 'LIFR',
}

export enum AirsigmetType {
  AIRMET = 'AIRMET',
  SIGMET = 'SIGMET',
}

export enum FlightDisplayMode {
  PLANNING = 'PLANNING', // Creating a new flight
  PREVIEW = 'PREVIEW', // Reviewing before saving
  VIEWING = 'VIEWING', // Looking at a saved flight
  EDITING = 'EDITING', // Modifying a saved flight
}

export enum FlightPlannerStep {
  ROUTE_BUILDING = 0,
  AIRCRAFT = 1,
  DATE_AND_ALTITUDE = 2,
  NAVLOG_PREVIEW = 3,
}
