import { ImageryProduct } from './types';

/**
 * The base URL for ArcGis world sattelite imagery
 */
export const ARCGIS_WORLD_IMAGERY_MAP_SERVER_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';

/**
 * The base URL for VFR Sectional Charts from FAA's servers on ARCGIS.
 */
export const ARCGIS_FAA_VFR_SECTIONAL_URL =
  'https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/VFR_Sectional/MapServer';

/**
 * The base URL for VFR Terminal Charts from FAA's servers on ARCGIS.
 */
export const ARCGIS_FAA_VFR_TERMINAL_URL =
  'https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/VFR_Terminal/MapServer';

/**
 * The base URL for IFR Low Charts from FAA's servers on ARCGIS.
 */
export const ARCGIS_FAA_IFR_LOW_URL =
  'https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/IFR_AreaLow/MapServer';

/**
 * The base URL for IFR High Charts from FAA's servers on ARCGIS.
 */
export const ARCGIS_FAA_IFR_HIGH_URL =
  'https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/IFR_High/MapServer';

export const ARCGIS_WORLD_IMAGERY_ICON_URL =
  'https://www.arcgis.com/sharing/rest/content/items/10df2279f9684e4a9f6a7f08febac2a9/info/thumbnail/thumbnail1584118328864.jpeg?w=400';

export const ARCGIS_3D_TERRAIN_PROVIDER_URL =
  'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer';

export const ARCGIS_NO_TERRAIN_VIEWMODEL_IMAGE_URL =
  'https://www.arcgis.com/sharing/rest/content/items/898f58f2ee824b3c97bae0698563a4b3/info/thumbnail/thumbnail1576627501851.jpeg?w=400';

export const ARCGIS_3D_TERRAIN_VIEWMODEL_IMAGE_URL =
  'https://www.arcgis.com/sharing/rest/content/items/58a541efc59545e6b7137f961d7de883/info/thumbnail/thumbnail1585609861151.png';

export const ARCIS_OPEN_STREET_MAPS_VIEWMODEL_IMAGE_URL =
  'https://www.arcgis.com/sharing/rest/content/items/3e1a00aeae81496587988075fe529f71/info/thumbnail/thumbnail1561337940804.jpeg?w=400';

export type ImageryLayerOption = { layerName: string; displayLabel: string };

/**
 * Set of imagery layer options as determined by charts available above.
 */
export const IMAGERY_LAYER_OPTIONS: ImageryLayerOption[] = [
  { layerName: 'None', displayLabel: 'None' },
  { layerName: 'vfrImagery', displayLabel: 'VFR' },
  { layerName: 'vfrTerminal', displayLabel: 'VFR TAC' },
  { layerName: 'ifrLowImagery', displayLabel: 'IFR Low' },
  { layerName: 'ifrHighImagery', displayLabel: 'IFR High' },
];

/**
 * Set of imagery products provided by AviationWeather.gov.
 */
export const IMAGERY_PRODUCTS: ImageryProduct[] = [
  {
    id: 'gairmet',
    name: 'GAIRMET',
    filters: {
      type: ['SIERRA', 'TANGO', 'ZULU-F', 'ZULU-I'],
      region: ['NC', 'NE', 'NW', 'SC', 'SE', 'SW', 'US'],
      hour: ['00', '03', '06', '09', '12'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/gairmet',
    fileExtension: 'gif',
  },
  {
    id: 'sigmet',
    name: 'SIGMET',
    filters: {
      type: ['ALL', 'CB', 'IC', 'IF', 'TB'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/sigmet',
    fileExtension: 'gif',
  },
  {
    id: 'wpc_prog',
    name: 'WPC Prog Chart',
    filters: {
      hour: [
        '000',
        '006',
        '012',
        '018',
        '024',
        '030',
        '036',
        '048',
        '060',
        '072',
        '096',
        '120',
        '144',
        '168',
      ],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/progs',
    fileExtension: 'gif',
  },
  {
    id: 'sigwx_low',
    name: 'SigWx - Low Level',
    filters: {
      hour: ['00', '06', '12', '18'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/swl',
    fileExtension: 'gif',
  },
  {
    id: 'sigwx_mid',
    name: 'SigWx - Mid Level',
    filters: {
      hour: ['00', '06', '12', '18'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/swm',
    fileExtension: 'gif',
  },
  {
    id: 'sigwx_high',
    name: 'SigWx - High Level',
    filters: {
      hour: ['00', '06', '12', '18'],
      area: ['A', 'B1', 'F', 'H', 'I', 'J', 'M'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/autosigwx',
    fileExtension: 'png',
  },
  {
    id: 'turbulence',
    name: 'Turbulence',
    filters: {
      hour: ['00', '01', '02', '03', '06', '09', '12', '15', '18'],
      level: [
        '010',
        '030',
        '060',
        '090',
        '120',
        '150',
        '180',
        '210',
        '240',
        '270',
        '300',
        '360',
        '420',
        '480',
        'MAXB',
        'MAXA',
      ],
      field: ['CAT', 'MTW', 'TOTAL'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/turbulence',
    fileExtension: 'gif',
  },
  {
    id: 'icing',
    name: 'Icing',
    filters: {
      hour: ['00', '01', '02', '03', '06', '09', '12', '15', '18'],
      level: ['010', '030', '060', '090', '120', '150', '180', '210', '240', '270', 'MAX'],
      field: ['PROB', 'SEV', 'SEVSLD'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/icing',
    fileExtension: 'gif',
  },
  {
    id: 'gfa',
    name: 'GFA',
    filters: {
      hour: ['03', '06', '09', '12', '15', '18'],
      type: ['SFC', 'CLOUDS'],
      region: ['US', 'E', 'W', 'C', 'NW', 'NC', 'NE', 'SE', 'SW', 'SC'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/gfa',
    fileExtension: 'png',
  },
  {
    id: 'tfm_gate',
    name: 'TFM Gate Forecast',
    filters: {
      city: [
        'KATL',
        'KCLT',
        'KORD',
        'KDFW',
        'KDEN',
        'KDTW',
        'KIAH',
        'KLAS',
        'KMEM',
        'KMIA',
        'KMSP',
        'KNYC',
        'KPHX',
        'KDCA',
      ],
    },
    baseUrl: 'https://www.aviationweather.gov/api/plot/gate_plot',
    fileExtension: 'gif',
  },
  {
    id: 'tcf',
    name: 'TCF',
    filters: {
      hour: ['04', '06', '08'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/tcf',
    fileExtension: 'gif',
  },
  {
    id: 'etcf',
    name: 'ETCF',
    filters: {
      hour: ['10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30'],
    },
    baseUrl: 'https://www.aviationweather.gov/data/products/etcf',
    fileExtension: 'gif',
  },
];
