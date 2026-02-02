/**
 * NOTAM Abbreviations Dictionary
 * Based on FAA 7930.2 Uniform Abbreviated Phraseology
 * https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html
 */

export const NOTAM_ABBREVIATIONS: Record<string, string> = {
  // Airspace & Navigation
  'ABN': 'Aerodrome Beacon',
  'ABV': 'Above',
  'ACC': 'Area Control Center',
  'ACFT': 'Aircraft',
  'ACT': 'Active/Activated',
  'AD': 'Aerodrome',
  'ADIZ': 'Air Defense Identification Zone',
  'ADS-B': 'Automatic Dependent Surveillance Broadcast',
  'ADS-C': 'Automatic Dependent Surveillance Contract',
  'AFD': 'Airport Facility Directory',
  'AGL': 'Above Ground Level',
  'AIS': 'Aeronautical Information Service',
  'ALS': 'Approach Lighting System',
  'ALSF': 'Approach Light System with Sequenced Flashing Lights',
  'ALT': 'Altitude',
  'ALTM': 'Altimeter',
  'AMDT': 'Amendment',
  'AMGR': 'Airport Manager',
  'AP': 'Airport',
  'APCH': 'Approach',
  'APD': 'Approach Path',
  'APD LGT': 'Approach Path Lights',
  'APP': 'Approach Control',
  'APRX': 'Approximately',
  'APRON': 'Apron',
  'ARP': 'Airport Reference Point',
  'ARR': 'Arrival',
  'ARPT': 'Airport',
  'ARTCC': 'Air Route Traffic Control Center',
  'ASOS': 'Automated Surface Observing System',
  'ASR': 'Airport Surveillance Radar',
  'ATC': 'Air Traffic Control',
  'ATIS': 'Automatic Terminal Information Service',
  'ATZ': 'Aerodrome Traffic Zone',
  'AUTH': 'Authorization/Authorized',
  'AVBL': 'Available',
  'AVN': 'Aviation',
  'AWOS': 'Automated Weather Observing System',

  // Directions & Bearings
  'AZM': 'Azimuth',
  'BLO': 'Below',
  'BND': 'Bound',
  'BTN': 'Between',
  'BYD': 'Beyond',

  // Communications
  'CCLKWS': 'Counterclockwise',
  'CD': 'Clearance Delivery',
  'CLKWS': 'Clockwise',
  'CLNC': 'Clearance',
  'CLSD': 'Closed',
  'CLSD TO': 'Closed To',
  'COM': 'Communications',
  'COMM': 'Communications',
  'CPDLC': 'Controller-Pilot Data Link Communications',
  'CTC': 'Contact',
  'CTL': 'Control',
  'CTLZ': 'Control Zone',
  'CTR': 'Center',

  // Facilities
  'DA': 'Decision Altitude',
  'DALGT': 'Daylight',
  'DCA': 'Distance of Closest Approach',
  'DCT': 'Direct',
  'DEP': 'Departure',
  'DER': 'Departure End of Runway',
  'DH': 'Decision Height',
  'DIS': 'Distance',
  'DIST': 'Distance',
  'DLY': 'Daily',
  'DME': 'Distance Measuring Equipment',
  'DP': 'Departure Procedure',
  'DPCG': 'Departure Procedure Change',
  'DSB': 'Double Sideband',
  'DTWN': 'Downtown',
  'DUSK': 'Dusk',
  'DW': 'Dual Wheel',

  // Operations
  'E': 'East',
  'EFAS': 'En Route Flight Advisory Service',
  'ELEV': 'Elevation',
  'ENG': 'Engine',
  'ENRT': 'En Route',
  'EXC': 'Except',
  'EXCP': 'Except',

  // Facilities & Equipment
  'FAA': 'Federal Aviation Administration',
  'FAC': 'Facility',
  'FAF': 'Final Approach Fix',
  'FBO': 'Fixed Base Operator',
  'FDC': 'Flight Data Center',
  'FIR': 'Flight Information Region',
  'FLTCK': 'Flight Check',
  'FM': 'From',
  'FNA': 'Final Approach',
  'FPM': 'Feet Per Minute',
  'FREQ': 'Frequency',
  'FSS': 'Flight Service Station',
  'FT': 'Feet',
  'FUEL': 'Fuel',

  // ILS & Landing Systems
  'GA': 'General Aviation',
  'GCA': 'Ground Controlled Approach',
  'GCO': 'Ground Communication Outlet',
  'GLD': 'Glide',
  'GLDSLP': 'Glideslope',
  'GND': 'Ground',
  'GP': 'Glide Path',
  'GPS': 'Global Positioning System',
  'GS': 'Glideslope',

  // Hazards
  'HAA': 'Height Above Airport',
  'HAT': 'Height Above Touchdown',
  'HAZ': 'Hazard',
  'HDG': 'Heading',
  'HEL': 'Helicopter',
  'HELI': 'Heliport',
  'HGT': 'Height',
  'HIRL': 'High Intensity Runway Lights',
  'HIWAS': 'Hazardous In-flight Weather Advisory Service',
  'HLDG': 'Holding',
  'HP': 'Holding Pattern',
  'HR': 'Hour',
  'HRS': 'Hours',

  // ILS Components
  'IAF': 'Initial Approach Fix',
  'IAP': 'Instrument Approach Procedure',
  'ICAO': 'International Civil Aviation Organization',
  'ID': 'Identification',
  'IDENT': 'Identification',
  'IF': 'Intermediate Fix',
  'IFR': 'Instrument Flight Rules',
  'ILS': 'Instrument Landing System',
  'IM': 'Inner Marker',
  'IMC': 'Instrument Meteorological Conditions',
  'IN': 'Inches',
  'INBD': 'Inbound',
  'INFO': 'Information',
  'INOP': 'Inoperative',
  'INSTR': 'Instrument',
  'INTL': 'International',
  'INTST': 'Intensity',

  // Navigation
  'L': 'Left',
  'LAA': 'Local Airport Advisory',
  'LAT': 'Latitude',
  'LCL': 'Local',
  'LCLZR': 'Localizer',
  'LDA': 'Localizer Type Directional Aid',
  'LDG': 'Landing',
  'LDIN': 'Lead-in',
  'LGT': 'Light',
  'LGTD': 'Lighted',
  'LIRL': 'Low Intensity Runway Lights',
  'LLWAS': 'Low Level Wind Shear Alert System',
  'LM': 'Locator Middle',
  'LO': 'Locator Outer',
  'LOC': 'Localizer',
  'LONG': 'Longitude',
  'LPV': 'Localizer Performance with Vertical Guidance',
  'LRNAV': 'Long Range Navigation',

  // Markers & Procedures
  'MAA': 'Maximum Authorized Altitude',
  'MAG': 'Magnetic',
  'MALS': 'Medium Intensity Approach Lighting System',
  'MALSF': 'Medium Intensity Approach Lighting System with Sequenced Flashing Lights',
  'MALSR': 'Medium Intensity Approach Lighting System with Runway Alignment Indicator Lights',
  'MAP': 'Missed Approach Point',
  'MAX': 'Maximum',
  'MCA': 'Minimum Crossing Altitude',
  'MDA': 'Minimum Descent Altitude',
  'MEA': 'Minimum En Route Altitude',
  'MED': 'Medium',
  'MET': 'Meteorological',
  'METAR': 'Aviation Routine Weather Report',
  'MIN': 'Minimum',
  'MIRL': 'Medium Intensity Runway Lights',
  'MKR': 'Marker',
  'MLS': 'Microwave Landing System',
  'MM': 'Middle Marker',
  'MNM': 'Minimum',
  'MNT': 'Monitor',
  'MNTNS': 'Mountains',
  'MOA': 'Military Operations Area',
  'MOC': 'Minimum Obstacle Clearance',
  'MOCA': 'Minimum Obstruction Clearance Altitude',
  'MRA': 'Minimum Reception Altitude',
  'MSA': 'Minimum Safe Altitude',
  'MSL': 'Mean Sea Level',
  'MTN': 'Mountain',
  'MU': 'Friction Measurement',
  'MUD': 'Mud',
  'MVA': 'Minimum Vectoring Altitude',

  // Navigation Aids
  'N': 'North',
  'NA': 'Not Authorized',
  'NAV': 'Navigation',
  'NAVAID': 'Navigational Aid',
  'NDB': 'Non-Directional Beacon',
  'NE': 'Northeast',
  'NGT': 'Night',
  'NM': 'Nautical Miles',
  'NML': 'Normal',
  'NOPT': 'No Procedure Turn Required',
  'NOTAM': 'Notice to Airmen',
  'NR': 'Number',
  'NW': 'Northwest',

  // Obstacles
  'OAT': 'Outside Air Temperature',
  'OB': 'Outbound',
  'OBS': 'Obstacle',
  'OBSC': 'Obscured',
  'OBST': 'Obstruction',
  'OBSTN': 'Obstruction',
  'OCA': 'Obstacle Clearance Altitude',
  'OCH': 'Obstacle Clearance Height',
  'ODALS': 'Omnidirectional Approach Lighting System',
  'OM': 'Outer Marker',
  'OP': 'Operational',
  'OPR': 'Operate/Operating/Operational',
  'ORIG': 'Original',
  'OTS': 'Out of Service',
  'OUTBD': 'Outbound',

  // Procedures
  'P': 'Prohibited Area',
  'PAPI': 'Precision Approach Path Indicator',
  'PAR': 'Precision Approach Radar',
  'PARL': 'Parallel',
  'PAT': 'Pattern',
  'PAX': 'Passengers',
  'PCL': 'Pilot Controlled Lighting',
  'PERM': 'Permanent',
  'PJE': 'Parachute Jumping Exercise',
  'PLW': 'Plow',
  'PN': 'Prior Notice',
  'PNR': 'Prior Notice Required',
  'PPR': 'Prior Permission Required',
  'PPSN': 'Present Position',
  'PRKG': 'Parking',
  'PROC': 'Procedure',
  'PROP': 'Propeller',
  'PT': 'Procedure Turn',
  'PTN': 'Procedure Turn',
  'PVT': 'Private',

  // Radio & Communications
  'R': 'Right/Restricted Area',
  'RAIL': 'Runway Alignment Indicator Lights',
  'RAMP': 'Ramp',
  'RCC': 'Rescue Coordination Center',
  'RCL': 'Runway Centerline',
  'RCLL': 'Runway Centerline Lights',
  'RCO': 'Remote Communications Outlet',
  'RDH': 'Reference Datum Height',
  'RDO': 'Radio',
  'REC': 'Receive/Receiver',
  'REIL': 'Runway End Identifier Lights',
  'REP': 'Report/Reporting Point',
  'RLLS': 'Runway Lead-in Light System',
  'RMK': 'Remark',
  'RNAV': 'Area Navigation',
  'RNP': 'Required Navigation Performance',
  'ROC': 'Rate of Climb',
  'RPLC': 'Replace',
  'RQR': 'Require',
  'RSR': 'En Route Surveillance Radar',
  'RTZL': 'Runway Touchdown Zone Lights',
  'RVR': 'Runway Visual Range',
  'RVSM': 'Reduced Vertical Separation Minimum',
  'RWY': 'Runway',

  // Surface & Conditions
  'S': 'South',
  'SALS': 'Short Approach Light System',
  'SALSF': 'Short Approach Light System with Sequenced Flashing Lights',
  'SAR': 'Search and Rescue',
  'SDF': 'Simplified Directional Facility',
  'SE': 'Southeast',
  'SER': 'Service',
  'SFC': 'Surface',
  'SID': 'Standard Instrument Departure',
  'SIGMET': 'Significant Meteorological Information',
  'SIMUL': 'Simultaneous',
  'SN': 'Snow',
  'SNGL': 'Single',
  'SPECI': 'Special Report',
  'SR': 'Sunrise',
  'SRN': 'Siren',
  'SS': 'Sunset',
  'SSALF': 'Simplified Short Approach Light with Sequenced Flashers',
  'SSALR': 'Simplified Short Approach Light with Runway Alignment',
  'SSALS': 'Simplified Short Approach Lighting System',
  'SSR': 'Secondary Surveillance Radar',
  'SSW': 'South-Southwest',
  'STAR': 'Standard Terminal Arrival Route',
  'STD': 'Standard',
  'STEP': 'Step Climb',
  'STOL': 'Short Takeoff and Landing',
  'STWL': 'Stopway Lights',
  'SUBJ': 'Subject',
  'SUPE': 'Supervisor',
  'SVC': 'Service',
  'SVN': 'Service',
  'SW': 'Southwest',
  'SWY': 'Stopway',

  // Taxiways & Traffic
  'T': 'Temperature/True',
  'TAA': 'Terminal Arrival Area',
  'TACAN': 'Tactical Air Navigation',
  'TAF': 'Terminal Aerodrome Forecast',
  'TAR': 'Terminal Area Surveillance Radar',
  'TAS': 'True Airspeed',
  'TCAS': 'Traffic Collision Avoidance System',
  'TCH': 'Threshold Crossing Height',
  'TD': 'Touchdown',
  'TDZ': 'Touchdown Zone',
  'TDZE': 'Touchdown Zone Elevation',
  'TDZL': 'Touchdown Zone Lights',
  'TEMPO': 'Temporary',
  'TFC': 'Traffic',
  'TFR': 'Temporary Flight Restriction',
  'TGL': 'Touch and Go Landing',
  'THN': 'Thin',
  'THR': 'Threshold',
  'THRU': 'Through',
  'TIL': 'Until',
  'TKOF': 'Takeoff',
  'TMA': 'Terminal Maneuvering Area',
  'TML': 'Terminal',
  'TODA': 'Takeoff Distance Available',
  'TORA': 'Takeoff Run Available',
  'TRML': 'Terminal',
  'TRN': 'Turn',
  'TRNG': 'Training',
  'TRSA': 'Terminal Radar Service Area',
  'TRSN': 'Transition',
  'TWR': 'Tower',
  'TWY': 'Taxiway',

  // Units & General
  'U/S': 'Unserviceable',
  'UAV': 'Unmanned Aerial Vehicle',
  'UDF': 'UHF Direction Finder',
  'UFN': 'Until Further Notice',
  'UHF': 'Ultra High Frequency',
  'UIR': 'Upper Information Region',
  'UNAVBL': 'Unavailable',
  'UNICOM': 'Universal Communications',
  'UNLGTD': 'Unlighted',
  'UNMKD': 'Unmarked',
  'UNMNT': 'Unmonitored',
  'UNREL': 'Unreliable',
  'UNUSBL': 'Unusable',
  'UNK': 'Unknown',

  // VFR & Visual
  'VAS': 'Visual Approach Slope',
  'VASI': 'Visual Approach Slope Indicator',
  'VDP': 'Visual Descent Point',
  'VFR': 'Visual Flight Rules',
  'VHF': 'Very High Frequency',
  'VIS': 'Visibility',
  'VMC': 'Visual Meteorological Conditions',
  'VOL': 'Volume',
  'VOLMET': 'Meteorological Information for Aircraft in Flight',
  'VOR': 'Very High Frequency Omnidirectional Range',
  'VORTAC': 'VOR and TACAN',
  'VOT': 'VOR Test Facility',
  'VR': 'VFR Military Training Route',

  // Weather
  'W': 'West',
  'WAAS': 'Wide Area Augmentation System',
  'WDI': 'Wind Direction Indicator',
  'WEF': 'With Effect From',
  'WI': 'Within',
  'WID': 'Width',
  'WIP': 'Work in Progress',
  'WKN': 'Weaken',
  'WND': 'Wind',
  'WPT': 'Waypoint',
  'WS': 'Wind Shear',
  'WSHFT': 'Wind Shift',
  'WSR': 'Wet Snow on Runway',
  'WTR': 'Water',
  'WX': 'Weather',

  // Miscellaneous
  'XMSN': 'Transmission',
  'XNG': 'Crossing',
  'XPDR': 'Transponder',

  // Status & Condition Abbreviations
  'CLRD': 'Cleared',
  'CNL': 'Cancel',
  'CNLD': 'Canceled',
  'CMPL': 'Complete',
  'CMPLTD': 'Completed',
  'CTAF': 'Common Traffic Advisory Frequency',
  'CWY': 'Clearway',

  // Time-related
  'DURN': 'Duration',
  'EFF': 'Effective',
  'EST': 'Estimated',
  'ESTD': 'Established',
  'UTC': 'Coordinated Universal Time',
  'ZULU': 'Coordinated Universal Time',

  // Runway Conditions
  'BA': 'Braking Action',
  'FAIR': 'Fair',
  'GOOD': 'Good',
  'NIL': 'None/Nil',
  'POOR': 'Poor',
  'WET': 'Wet',
  'DRY': 'Dry',
  'ICY': 'Icy',
  'COMPACTED': 'Compacted',
  'SLIPPERY': 'Slippery',
  'FICON': 'Field Condition',

  // Additional Common Abbreviations
  'ACRS': 'Acres',
  'ADJ': 'Adjacent',
  'ADQ': 'Adequate',
  'AFSS': 'Automated Flight Service Station',
  'ALTN': 'Alternate',
  'ALSTG': 'Altimeter Setting',
  'AMEND': 'Amend',
  'AND': 'And',
  'ARFF': 'Aircraft Rescue and Firefighting',
  'ASL': 'Above Sea Level',
  'AT': 'At',
  'BC': 'Back Course',
  'BCKG': 'Backing',
  'BLDG': 'Building',
  'BLW': 'Below',
  'BR': 'Branch',
  'BRG': 'Bearing',
  'BTW': 'Between',
  'CAUTION': 'Caution',
  'CB': 'Cumulonimbus',
  'CIG': 'Ceiling',
  'CHG': 'Change',
  'CLR': 'Clear',
  'CONC': 'Concrete',
  'COND': 'Condition',
  'CONST': 'Construction',
  'CONT': 'Continue',
  'CTLD': 'Controlled',
  'DESIG': 'Designated',
  'DIM': 'Dim',
  'DIR': 'Direction',
  'DISPL': 'Displaced',
  'DNG': 'Dangerous',
  'DNGR': 'Danger',
  'DT': 'Daylight Time',
  'DTW': 'Dual Tandem Wheel',
  'DUPE': 'Duplicate',
  'DUR': 'Duration',
  'DWPNT': 'Dewpoint',
  'E-W': 'East-West',
  'ECON': 'Economic',
  'EMERG': 'Emergency',
  'END': 'End',
  'ENE': 'East-Northeast',
  'ESE': 'East-Southeast',
  'EXP': 'Expect',
  'EXPT': 'Expect',
  'EXT': 'Extend',
  'FINAL': 'Final',
  'FLD': 'Field',
  'FLT': 'Flight',
  'FLW': 'Follow',
  'FOD': 'Foreign Object Debris',
  'FRZN': 'Frozen',
  'FST': 'First',
  'GEN': 'General',
  'GRD': 'Ground',
  'GRVL': 'Gravel',
  'HDWY': 'Headway',
  'INC': 'Including',
  'INCL': 'Include',
  'INDFNT': 'Indefinite',
  'INTXN': 'Intersection',
  'JET': 'Jet',
  'K': 'Knots',
  'KT': 'Knots',
  'KTS': 'Knots',
  'LAN': 'Inland',
  'LEN': 'Length',
  'LGTS': 'Lights',
  'LMTD': 'Limited',
  'LNDG': 'Landing',
  'LST': 'Last',
  'MAJ': 'Major',
  'MARKINGS': 'Markings',
  'MGTW': 'Maximum Gross Takeoff Weight',
  'MNTC': 'Maintenance',
  'MON': 'Monday',
  'MOV': 'Move',
  'MRK': 'Mark',
  'MRKG': 'Marking',
  'MULTI': 'Multiple',
  'N-S': 'North-South',
  'NBR': 'Number',
  'NCTD': 'Not Conducted',
  'NEG': 'Negative',
  'NO': 'No',
  'NON': 'None',
  'NNE': 'North-Northeast',
  'NNW': 'North-Northwest',
  'NON-STD': 'Non-Standard',
  'NOTC': 'Notice',
  'NTL': 'National',
  'OBSCD': 'Obscured',
  'OPER': 'Operator',
  'OPN': 'Open',
  'OPNS': 'Operations',
  'OR': 'Or',
  'OUT': 'Out',
  'OVRN': 'Overrun',
  'PAEW': 'Personnel and Equipment Working',
  'PB': 'Pushback',
  'PCN': 'Pavement Classification Number',
  'PERS': 'Personnel',
  'PLA': 'Practice Low Approach',
  'PLGD': 'Plowed',
  'PLWD': 'Plowed',
  'POS': 'Position',
  'POSSIBLE': 'Possible',
  'PREV': 'Previous',
  'PRMRY': 'Primary',
  'PS': 'Plus',
  'QDR': 'Magnetic Bearing',
  'QSTNL': 'Questionable',
  'RAD': 'Radius',
  'RCV': 'Receive',
  'RDGE': 'Ridge',
  'REAS': 'Reason',
  'RECMD': 'Recommend',
  'RECON': 'Reconnaissance',
  'RECT': 'Rectangle',
  'REF': 'Reference',
  'REG': 'Regulation',
  'REL': 'Relative',
  'RELBL': 'Reliable',
  'REQ': 'Request',
  'RESTR': 'Restriction',
  'RESUME': 'Resume',
  'RET': 'Retired',
  'RETD': 'Returned',
  'REVSD': 'Revised',
  'RNG': 'Range',
  'ROTG': 'Rotating',
  'RSC': 'Runway Surface Condition',
  'RSN': 'Reason',
  'RSTR': 'Restrict',
  'RSTRD': 'Restricted',
  'RTE': 'Route',
  'SCHED': 'Schedule',
  'SCTR': 'Sector',
  'SDY': 'Sandy',
  'SEC': 'Sector/Section',
  'SEP': 'Separate',
  'SERV': 'Service',
  'SEVR': 'Severe',
  'SGT': 'Segment',
  'SHFT': 'Shift',
  'SHRT': 'Short',
  'SIGWX': 'Significant Weather',
  'SLO': 'Slow',
  'SLPR': 'Slippery',
  'SM': 'Statute Miles',
  'SNBNK': 'Snowbank',
  'SOD': 'Sod',
  'SPD': 'Speed',
  'SPN': 'Span',
  'SQWK': 'Squawk',
  'STA': 'Station',
  'STN': 'Station',
  'STROBE': 'Strobe',
  'SUN': 'Sunday',
  'SUPSD': 'Superseded',
  'SURF': 'Surface',
  'SURV': 'Survey',
  'SVFR': 'Special VFR',
  'SWD': 'Snowed',
  'SYST': 'System',
  'TAX': 'Taxi',
  'TERM': 'Terminal',
  'TEST': 'Test',
  'THD': 'Thread',
  'THLD': 'Threshold',
  'THU': 'Thursday',
  'TKWY': 'Taxiway',
  'TMP': 'Temporary',
  'TO': 'To',
  'TP': 'Turning Point',
  'TRK': 'Track',
  'TUE': 'Tuesday',
  'TWEB': 'Transcribed Weather Broadcast',
  'TWO-WAY': 'Two-Way',
  'TYP': 'Type',
  'UAS': 'Unmanned Aircraft System',
  'UNLTD': 'Unlimited',
  'UPR': 'Upper',
  'USGN': 'Unsigned',
  'VAL': 'Valid',
  'VAR': 'Variable',
  'VCNTY': 'Vicinity',
  'VER': 'Vertical',
  'VERT': 'Vertical',
  'VIA': 'Via',
  'VICTY': 'Vicinity',
  'VSBY': 'Visibility',
  'VSP': 'Vertical Speed',
  'WAC': 'World Aeronautical Chart',
  'WARN': 'Warning',
  'WED': 'Wednesday',
  'WHT': 'White',
  'WKDAY': 'Weekday',
  'WKEND': 'Weekend',
  'WNW': 'West-Northwest',
  'WDSPR': 'Widespread',
  'WSW': 'West-Southwest',
  'XPNDR': 'Transponder',
  'YEL': 'Yellow',
  'ZN': 'Zone',
};

/**
 * Compound abbreviations that contain special characters and must be matched first
 */
const COMPOUND_ABBREVIATIONS: Record<string, string> = {
  'U/S': 'Unserviceable',
  'N-S': 'North-South',
  'E-W': 'East-West',
  'A/G': 'Air/Ground',
  'N/A': 'Not Applicable',
  'H24': '24 Hours',
  'H/J': 'Sunrise to Sunset',
  'VOR/DME': 'VOR/DME',
  'ILS/DME': 'ILS/DME',
};

/**
 * Translates a NOTAM text by expanding known abbreviations
 * while preserving the original structure
 */
export function translateNotam(rawText: string): string {
  if (!rawText) return '';

  let result = rawText;

  // First pass: replace compound abbreviations that contain special characters
  // Sort by length (longest first) to avoid partial matches
  const compoundKeys = Object.keys(COMPOUND_ABBREVIATIONS).sort((a, b) => b.length - a.length);
  for (const key of compoundKeys) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, COMPOUND_ABBREVIATIONS[key]);
  }

  // Second pass: split into words and translate individual abbreviations
  // Split on whitespace and punctuation, but preserve the delimiters
  const words = result.split(/(\s+|(?<![A-Za-z])\/(?![A-Za-z])|\.(?!\d)|,|\(|\))/);

  return words.map(word => {
    // Skip empty strings and delimiters
    if (!word || /^[\s\/\.\,\(\)]+$/.test(word)) {
      return word;
    }

    // Check for exact match (case-insensitive)
    const upperWord = word.toUpperCase();
    if (NOTAM_ABBREVIATIONS[upperWord]) {
      return NOTAM_ABBREVIATIONS[upperWord];
    }

    // Check if word ends with common suffixes and try base word
    if (upperWord.endsWith('S') && upperWord.length > 2 && NOTAM_ABBREVIATIONS[upperWord.slice(0, -1)]) {
      return NOTAM_ABBREVIATIONS[upperWord.slice(0, -1)] + 's';
    }

    return word;
  }).join('');
}

/**
 * Checks if a NOTAM is critical based on keywords in the text
 * Critical NOTAMs include: closures, inoperative equipment, and TFRs
 */
export function isCriticalNotam(text: string): boolean {
  const upperText = text.toUpperCase();
  return (
    // Closures
    upperText.includes('CLSD') ||
    upperText.includes('CLOSED') ||
    // Inoperative/Unserviceable
    upperText.includes('INOP') ||
    upperText.includes('U/S') ||
    upperText.includes('UNSERVICEABLE') ||
    upperText.includes('OUT OF SERVICE') ||
    upperText.includes('NOT AVBL') ||
    upperText.includes('UNAVBL') ||
    // TFRs and flight restrictions
    upperText.includes('TFR') ||
    upperText.includes('TEMPORARY FLIGHT RESTRICTION')
  );
}

/**
 * Gets the color for a NOTAM based on keywords in the text
 */
export function getNotamSeverityColor(text: string): string {
  const upperText = text.toUpperCase();

  // Critical/Safety keywords (closures, inoperative, TFRs)
  if (isCriticalNotam(text)) {
    return 'red';
  }

  // Warning keywords
  if (upperText.includes('CAUTION') ||
      upperText.includes('WARNING') ||
      upperText.includes('HAZARD') ||
      upperText.includes('DANGER') ||
      upperText.includes('OBST') ||
      upperText.includes('OBSTRUCTION') ||
      upperText.includes('CRANE') ||
      upperText.includes('TOWER') ||
      upperText.includes('WIP') ||
      upperText.includes('WORK IN PROGRESS') ||
      upperText.includes('CONST') ||
      upperText.includes('CONSTRUCTION') ||
      upperText.includes('PROHIBITED') ||
      upperText.includes('RESTRICTED')) {
    return 'orange';
  }

  // Information keywords
  if (upperText.includes('CHANGED') ||
      upperText.includes('RELOCATED') ||
      upperText.includes('ACTIVATED') ||
      upperText.includes('NEW')) {
    return 'blue';
  }

  // Default
  return 'gray';
}

/**
 * Categorizes a NOTAM based on its content
 */
export function categorizeNotam(text: string): string {
  const upperText = text.toUpperCase();

  if (upperText.includes('RWY') || upperText.includes('RUNWAY')) return 'Runway';
  if (upperText.includes('TWY') || upperText.includes('TAXIWAY')) return 'Taxiway';
  if (upperText.includes('APRON') || upperText.includes('RAMP')) return 'Apron';
  if (upperText.includes('NAV') || upperText.includes('VOR') || upperText.includes('NDB') || upperText.includes('ILS') || upperText.includes('LOC') || upperText.includes('GS')) return 'Navigation';
  if (upperText.includes('LGT') || upperText.includes('LIGHT') || upperText.includes('PAPI') || upperText.includes('VASI') || upperText.includes('REIL')) return 'Lighting';
  if (upperText.includes('OBST') || upperText.includes('TOWER') || upperText.includes('CRANE')) return 'Obstruction';
  if (upperText.includes('SVC') || upperText.includes('SERVICE') || upperText.includes('FUEL')) return 'Services';
  if (upperText.includes('AIRSPACE') || upperText.includes('TFR') || upperText.includes('MOA') || upperText.includes('RESTRICTED')) return 'Airspace';
  if (upperText.includes('COM') || upperText.includes('FREQ') || upperText.includes('ATIS') || upperText.includes('CTAF')) return 'Communications';
  if (upperText.includes('AD') || upperText.includes('AIRPORT') || upperText.includes('AERODROME')) return 'Aerodrome';

  return 'General';
}
