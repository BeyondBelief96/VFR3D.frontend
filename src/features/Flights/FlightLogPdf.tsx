import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {
  FlightDto,
  AirportDto,
  MetarDto,
  TafDto,
  TafForecast,
  MetarSkyConditionDto,
  TafSkyCondition,
  RunwayDto,
  CommunicationFrequencyDto,
  AirportCrosswindResponseDto,
  WeightBalanceCalculationDto,
  WeightBalanceCgResultDto,
  StationBreakdownDto,
} from '@/redux/api/vfr3d/dtos';

// Register Roboto fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e3a5f',
  },
  subheader: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    padding: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#64748b',
  },
  value: {
    flex: 1,
    color: '#1e293b',
  },
  warningBox: {
    backgroundColor: '#fef9c3',
    borderColor: '#ca8a04',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 4,
  },
  warningText: {
    fontSize: 9,
    color: '#713f12',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 6,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  col1: { width: '8%' },
  col2: { width: '12%' },
  col3: { width: '12%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '10%' },
  col8: { width: '10%' },
  col9: { width: '10%' },
  col10: { width: '8%' },
  // Airport table columns
  airportCol1: { width: '15%' },
  airportCol2: { width: '25%' },
  airportCol3: { width: '15%' },
  airportCol4: { width: '15%' },
  airportCol5: { width: '15%' },
  airportCol6: { width: '15%' },
  // Runway table columns
  runwayCol1: { width: '20%' },
  runwayCol2: { width: '20%' },
  runwayCol3: { width: '20%' },
  runwayCol4: { width: '20%' },
  runwayCol5: { width: '20%' },
  // Frequency table columns
  freqCol1: { width: '20%' },
  freqCol2: { width: '25%' },
  freqCol3: { width: '55%' },
  // Weight & Balance table columns
  wbCol1: { width: '30%' },
  wbCol2: { width: '17.5%' },
  wbCol3: { width: '17.5%' },
  wbCol4: { width: '17.5%' },
  wbCol5: { width: '17.5%' },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 20,
    right: 30,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 30,
    color: '#94a3b8',
  },
  metarBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  metarTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e3a5f',
  },
  metarText: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#374151',
  },
  airportCard: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  airportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  airportName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  airportIdent: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  windBox: {
    backgroundColor: '#dbeafe',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  windText: {
    fontSize: 9,
    color: '#1e40af',
    textAlign: 'center',
  },
  recommendedBadge: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  infoItem: {
    width: '25%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 9,
    color: '#1e293b',
  },
  // Weather styles
  weatherCard: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  weatherStationId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  flightCategoryBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  vfrBadge: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
  },
  mvfrBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  ifrBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  lifrBadge: {
    backgroundColor: '#9333ea',
    color: '#ffffff',
  },
  rawMetarBox: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  rawMetarText: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: '#e2e8f0',
    lineHeight: 1.4,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  weatherGridItem: {
    width: '25%',
    marginBottom: 8,
  },
  weatherGridItemWide: {
    width: '50%',
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  weatherValue: {
    fontSize: 10,
    color: '#1e293b',
  },
  weatherValueBold: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  gustWarning: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  skyConditionsBox: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  skyConditionRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  tafTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginTop: 12,
    marginBottom: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tafValidityText: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 8,
  },
  forecastPeriod: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  forecastChange: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  forecastTime: {
    fontSize: 8,
    color: '#64748b',
  },
  forecastDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  forecastItem: {
    width: '33%',
    marginBottom: 4,
  },
  observationTime: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'right',
  },
  // Weight & Balance styles
  wbResultCard: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 2,
  },
  wbResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wbResultTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  wbStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  wbWithinLimits: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
  },
  wbOutsideLimits: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  wbResultGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  wbResultItem: {
    marginRight: 20,
  },
  wbWarningBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  wbWarningText: {
    fontSize: 9,
    color: '#92400e',
  },
  // Route arrow styling
  routeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeWaypoint: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  routeArrow: {
    fontSize: 12,
    color: '#64748b',
    marginHorizontal: 4,
  },
});


// Helper functions
const formatDuration = (hours?: number): string => {
  if (!hours) return '--';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatTime = (date?: Date | string): string => {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDateTime = (date?: Date | string): string => {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatWindComponent = (component?: number): string => {
  if (component === undefined || component === null) return '--';
  const isHeadwind = component >= 0;
  return `${isHeadwind ? '+' : ''}${Math.round(component)} kt ${isHeadwind ? 'HW' : 'TW'}`;
};

const formatSurfaceType = (surfaceType?: string): string => {
  if (!surfaceType || surfaceType === 'Unknown') return 'Unknown';
  return surfaceType.replace(/([A-Z])/g, ' $1').trim();
};

// Weather helper functions
const getFlightCategoryStyle = (category?: string) => {
  switch (category) {
    case 'VFR':
      return styles.vfrBadge;
    case 'MVFR':
      return styles.mvfrBadge;
    case 'IFR':
      return styles.ifrBadge;
    case 'LIFR':
      return styles.lifrBadge;
    default:
      return { backgroundColor: '#6b7280', color: '#ffffff' };
  }
};

const formatWindDirection = (dir?: string | number): string => {
  if (dir === undefined || dir === null) return '--';
  if (dir === 'VRB' || dir === 'Variable') return 'VRB';
  return `${dir}°`;
};

const formatVisibility = (vis?: string | number): string => {
  if (vis === undefined || vis === null) return '--';
  return `${vis} SM`;
};

const formatTemperature = (tempC?: number, dewC?: number): string => {
  if (tempC === undefined && dewC === undefined) return '--';
  const temp = tempC !== undefined ? `${tempC}°C` : '--';
  const dew = dewC !== undefined ? `${dewC}°C` : '--';
  return `${temp} / ${dew}`;
};

const formatAltimeter = (altim?: number): string => {
  if (altim === undefined || altim === null) return '--';
  return `${altim.toFixed(2)}" Hg`;
};

const formatSkyConditions = (conditions?: MetarSkyConditionDto[] | TafSkyCondition[]): string => {
  if (!conditions || conditions.length === 0) return 'Clear / Not reported';
  return conditions
    .map((c) => {
      const cover = c.skyCover || 'SKC';
      const base = c.cloudBaseFtAgl ? ` @ ${c.cloudBaseFtAgl.toLocaleString()} ft` : '';
      return `${cover}${base}`;
    })
    .join(', ');
};

const formatForecastTime = (from?: string, to?: string): string => {
  if (!from) return '';
  const fromTime = new Date(from).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  if (!to) return fromTime;
  const toTime = new Date(to).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${fromTime} - ${toTime}`;
};

const getChangeIndicatorText = (indicator?: string): string => {
  switch (indicator) {
    case 'FM':
      return 'From';
    case 'TEMPO':
      return 'Temporary';
    case 'BECMG':
      return 'Becoming';
    case 'PROB':
      return 'Probability';
    default:
      return indicator || 'Initial';
  }
};

// Route display component with proper arrows
const RouteDisplay: React.FC<{ waypoints: { name?: string }[] }> = ({ waypoints }) => (
  <View style={styles.routeContainer}>
    {waypoints.map((wp, idx) => (
      <React.Fragment key={idx}>
        <Text style={styles.routeWaypoint}>{wp.name || '--'}</Text>
        {idx < waypoints.length - 1 && <Text style={styles.routeArrow}> → </Text>}
      </React.Fragment>
    ))}
  </View>
);

export interface FlightLogPdfProps {
  flightData: FlightDto;
  airports?: AirportDto[];
  metars?: { [key: string]: MetarDto };
  tafs?: { [key: string]: TafDto };
  runways?: { [key: string]: RunwayDto[] };
  frequencies?: { [key: string]: CommunicationFrequencyDto[] };
  crosswindData?: { [key: string]: AirportCrosswindResponseDto };
  weightBalance?: WeightBalanceCalculationDto | null;
}

// Weight & Balance Result Card Component
const WBResultCard: React.FC<{
  title: string;
  result: WeightBalanceCgResultDto;
  color: string;
}> = ({ title, result, color }) => (
  <View
    style={[
      styles.wbResultCard,
      {
        backgroundColor: result.isWithinEnvelope ? `${color}10` : '#fef2f210',
        borderColor: result.isWithinEnvelope ? color : '#ef4444',
      },
    ]}
  >
    <View style={styles.wbResultHeader}>
      <Text style={styles.wbResultTitle}>{title}</Text>
      <View
        style={[
          styles.wbStatusBadge,
          result.isWithinEnvelope ? styles.wbWithinLimits : styles.wbOutsideLimits,
        ]}
      >
        <Text style={{ color: '#ffffff', fontSize: 8, fontWeight: 'bold' }}>
          {result.isWithinEnvelope ? 'WITHIN LIMITS' : 'OUTSIDE LIMITS'}
        </Text>
      </View>
    </View>
    <View style={styles.wbResultGrid}>
      <View style={styles.wbResultItem}>
        <Text style={styles.infoLabel}>Gross Weight</Text>
        <Text style={[styles.infoValue, { fontWeight: 'bold', fontSize: 12 }]}>
          {result.totalWeight?.toLocaleString() || '--'} lbs
        </Text>
      </View>
      <View style={styles.wbResultItem}>
        <Text style={styles.infoLabel}>CG Location</Text>
        <Text style={[styles.infoValue, { fontWeight: 'bold', fontSize: 12 }]}>
          {result.cgArm?.toFixed(2) || '--'} in
        </Text>
      </View>
      <View style={styles.wbResultItem}>
        <Text style={styles.infoLabel}>Total Moment</Text>
        <Text style={styles.infoValue}>{result.totalMoment?.toLocaleString() || '--'}</Text>
      </View>
    </View>
  </View>
);

// Weight Breakdown Table Component
const WeightBreakdownTable: React.FC<{ breakdown: StationBreakdownDto[] }> = ({ breakdown }) => {
  // Calculate total weight for percentage display
  const totalWeight = breakdown.reduce((sum, station) => sum + (station.weight || 0), 0);

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.wbCol1}>Station</Text>
        <Text style={styles.wbCol2}>Weight (lbs)</Text>
        <Text style={styles.wbCol3}>Arm (in)</Text>
        <Text style={styles.wbCol4}>Moment</Text>
        <Text style={styles.wbCol5}>% of Total</Text>
      </View>
      {breakdown.map((station, idx) => {
        const percentOfTotal = totalWeight > 0 ? ((station.weight || 0) / totalWeight) * 100 : 0;
        return (
          <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.wbCol1}>{station.name || '--'}</Text>
            <Text style={styles.wbCol2}>{station.weight?.toFixed(1) || '--'}</Text>
            <Text style={styles.wbCol3}>{station.arm?.toFixed(2) || '--'}</Text>
            <Text style={styles.wbCol4}>{station.moment?.toFixed(0) || '--'}</Text>
            <Text style={styles.wbCol5}>{percentOfTotal.toFixed(1)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

export const FlightLogPdf: React.FC<FlightLogPdfProps> = ({
  flightData,
  airports = [],
  metars = {},
  tafs = {},
  runways = {},
  frequencies = {},
  crosswindData = {},
  weightBalance,
}) => {
  if (!flightData || !flightData.legs || flightData.legs.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>VFR3D Navigation Log</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>No flight data available</Text>
          </View>
        </Page>
      </Document>
    );
  }

  let pageNumber = 1;

  return (
    <Document>
      {/* Page 1: Flight Overview and Nav Log */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>VFR3D Navigation Log</Text>
        {flightData.waypoints && <RouteDisplay waypoints={flightData.waypoints} />}

        {/* Disclaimer */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            FOR FLIGHT SIMULATION AND PLANNING REFERENCE ONLY. NOT FOR ACTUAL NAVIGATION.
            Always verify information with official sources and current weather before flight.
          </Text>
        </View>

        {/* Flight Overview */}
        <Text style={styles.sectionTitle}>Flight Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Flight Name:</Text>
          <Text style={styles.value}>{flightData.name || 'Unnamed Flight'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Departure:</Text>
          <Text style={styles.value}>{flightData.waypoints?.[0]?.name || '--'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>
            {flightData.waypoints?.[flightData.waypoints.length - 1]?.name || '--'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Departure Time:</Text>
          <Text style={styles.value}>{formatDateTime(flightData.departureTime)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cruise Altitude:</Text>
          <Text style={styles.value}>
            {flightData.plannedCruisingAltitude?.toLocaleString() || '--'} ft MSL
          </Text>
        </View>
        {flightData.aircraft && (
          <View style={styles.row}>
            <Text style={styles.label}>Aircraft:</Text>
            <Text style={styles.value}>
              {flightData.aircraft.tailNumber || 'N/A'} - {flightData.aircraft.aircraftType || 'Unknown'}
            </Text>
          </View>
        )}

        {/* Flight Statistics */}
        <Text style={styles.sectionTitle}>Flight Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Distance</Text>
            <Text style={styles.statValue}>
              {flightData.totalRouteDistance?.toFixed(1) || '--'} NM
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Flight Time</Text>
            <Text style={styles.statValue}>{formatDuration(flightData.totalRouteTimeHours)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Fuel Required</Text>
            <Text style={styles.statValue}>
              {flightData.totalFuelUsed?.toFixed(1) || '--'} gal
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Wind</Text>
            <Text style={styles.statValue}>
              {formatWindComponent(flightData.averageWindComponent)}
            </Text>
          </View>
        </View>

        {/* Navigation Log Table */}
        <Text style={styles.sectionTitle}>Navigation Log</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Leg</Text>
            <Text style={styles.col2}>From</Text>
            <Text style={styles.col3}>To</Text>
            <Text style={styles.col4}>Dist</Text>
            <Text style={styles.col5}>Hdg</Text>
            <Text style={styles.col6}>GS</Text>
            <Text style={styles.col7}>ETE</Text>
            <Text style={styles.col8}>Start</Text>
            <Text style={styles.col9}>End</Text>
            <Text style={styles.col10}>Fuel</Text>
          </View>

          {/* Table Rows */}
          {flightData.legs.map((leg, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{leg.legStartPoint?.name || '--'}</Text>
              <Text style={styles.col3}>{leg.legEndPoint?.name || '--'}</Text>
              <Text style={styles.col4}>{leg.legDistance?.toFixed(1) || '--'}</Text>
              <Text style={styles.col5}>{leg.magneticHeading?.toFixed(0) || '--'}°</Text>
              <Text style={styles.col6}>{leg.groundSpeed?.toFixed(0) || '--'}</Text>
              <Text style={styles.col7}>
                {leg.legDistance && leg.groundSpeed
                  ? formatDuration(leg.legDistance / leg.groundSpeed)
                  : '--'}
              </Text>
              <Text style={styles.col8}>{formatTime(leg.startLegTime)}</Text>
              <Text style={styles.col9}>{formatTime(leg.endLegTime)}</Text>
              <Text style={styles.col10}>{leg.legFuelBurnGals?.toFixed(1) || '--'}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Generated by VFR3D</Text>
        <Text style={styles.pageNumber}>Page {pageNumber++}</Text>
      </Page>

      {/* Page 2: Weight & Balance (if available) */}
      {weightBalance && (weightBalance.takeoff || weightBalance.landing) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>Weight & Balance</Text>
          {flightData.waypoints && <RouteDisplay waypoints={flightData.waypoints} />}

          {/* Warnings */}
          {weightBalance.warnings && weightBalance.warnings.length > 0 && (
            <View style={styles.wbWarningBox}>
              {weightBalance.warnings.map((warning, idx) => (
                <Text key={idx} style={styles.wbWarningText}>
                  {warning}
                </Text>
              ))}
            </View>
          )}

          {/* Takeoff Result */}
          {weightBalance.takeoff && (
            <WBResultCard title="TAKEOFF" result={weightBalance.takeoff} color="#22c55e" />
          )}

          {/* Landing Result */}
          {weightBalance.landing && (
            <WBResultCard title="LANDING" result={weightBalance.landing} color="#3b82f6" />
          )}

          {/* Calculation Details */}
          <View style={[styles.infoGrid, { marginTop: 10, marginBottom: 15 }]}>
            {weightBalance.envelopeName && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CG Envelope</Text>
                <Text style={styles.infoValue}>{weightBalance.envelopeName}</Text>
              </View>
            )}
            {weightBalance.fuelBurnGallons !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fuel Burn</Text>
                <Text style={styles.infoValue}>{weightBalance.fuelBurnGallons} gal</Text>
              </View>
            )}
            {weightBalance.calculatedAt && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Calculated</Text>
                <Text style={styles.infoValue}>{formatDateTime(weightBalance.calculatedAt)}</Text>
              </View>
            )}
          </View>

          {/* Weight Breakdown Table */}
          {weightBalance.stationBreakdown && weightBalance.stationBreakdown.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Weight Breakdown</Text>
              <WeightBreakdownTable breakdown={weightBalance.stationBreakdown} />
            </>
          )}

          <Text style={styles.footer}>Generated by VFR3D</Text>
          <Text style={styles.pageNumber}>Page {pageNumber++}</Text>
        </Page>
      )}

      {/* Page 3: Airport Information */}
      {airports.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>Airport Information</Text>
          {flightData.waypoints && <RouteDisplay waypoints={flightData.waypoints} />}

          {airports.map((airport) => {
            const ident = airport.icaoId || airport.arptId || '';
            const airportRunways = runways[ident] || [];
            const airportFrequencies = frequencies[ident] || [];
            const airportCrosswind = crosswindData[ident];
            const metar = metars[ident];

            // Format magnetic variation
            const magVar = airport.magVarn
              ? `${airport.magVarn}° ${airport.magHemis || 'E'}`
              : '--';

            return (
              <View key={airport.siteNo} style={styles.airportCard} wrap={false}>
                {/* Airport Header */}
                <View style={styles.airportHeader}>
                  <View>
                    <Text style={styles.airportIdent}>{ident}</Text>
                    <Text style={styles.airportName}>{airport.arptName}</Text>
                    <Text style={{ fontSize: 9, color: '#64748b' }}>
                      {airport.city}, {airport.stateCode}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                      {airport.elev?.toLocaleString() || '--'} ft MSL
                    </Text>
                    {airport.fuelTypes && (
                      <Text style={{ fontSize: 8, color: '#64748b' }}>
                        Fuel: {airport.fuelTypes}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Airport Details Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Coordinates</Text>
                    <Text style={styles.infoValue}>
                      {airport.latDecimal?.toFixed(4) || '--'}, {airport.longDecimal?.toFixed(4) || '--'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Mag Variation</Text>
                    <Text style={styles.infoValue}>{magVar}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Chart</Text>
                    <Text style={styles.infoValue}>{airport.chartName || '--'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValue}>{airport.arptStatus || 'Operational'}</Text>
                  </View>
                </View>

                {/* Current Weather Summary */}
                {metar && (
                  <View style={[styles.windBox, { backgroundColor: '#f1f5f9', marginBottom: 10 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: '#1e293b', fontWeight: 'bold' }}>
                        Current Weather
                      </Text>
                      {metar.flightCategory && (
                        <View style={[styles.flightCategoryBadge, getFlightCategoryStyle(metar.flightCategory), { paddingVertical: 2, paddingHorizontal: 6 }]}>
                          <Text style={{ color: '#ffffff', fontSize: 8, fontWeight: 'bold' }}>
                            {metar.flightCategory}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 8, color: '#374151', marginTop: 4 }}>
                      Wind: {metar.windDirDegrees === 'VRB' ? 'Variable' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt}kt
                      {metar.windGustKt && ` G${metar.windGustKt}`}
                      {' | '}Vis: {metar.visibilityStatuteMi} SM
                      {' | '}Alt: {metar.altimInHg?.toFixed(2)}"
                      {metar.wxString && ` | ${metar.wxString}`}
                    </Text>
                  </View>
                )}

                {/* Wind/Crosswind Info */}
                {airportCrosswind && (
                  <View style={styles.windBox}>
                    <Text style={styles.windText}>
                      Wind: {airportCrosswind.windDirectionDegrees}° @ {airportCrosswind.windSpeedKt}kt
                      {airportCrosswind.windGustKt && ` G${airportCrosswind.windGustKt}`}
                      {airportCrosswind.recommendedRunway && (
                        <>  |  Recommended: Rwy {airportCrosswind.recommendedRunway}</>
                      )}
                    </Text>
                  </View>
                )}

                {/* Runways */}
                {airportRunways.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>Runways</Text>
                    <View style={styles.table}>
                      <View style={styles.tableHeader}>
                        <Text style={styles.runwayCol1}>Runway</Text>
                        <Text style={styles.runwayCol2}>Length</Text>
                        <Text style={styles.runwayCol3}>Width</Text>
                        <Text style={styles.runwayCol4}>Surface</Text>
                        <Text style={styles.runwayCol5}>Lights</Text>
                      </View>
                      {airportRunways.map((runway, idx) => (
                        <View
                          key={runway.id || idx}
                          style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                        >
                          <Text style={styles.runwayCol1}>{runway.runwayId || '--'}</Text>
                          <Text style={styles.runwayCol2}>
                            {runway.length ? `${runway.length.toLocaleString()} ft` : '--'}
                          </Text>
                          <Text style={styles.runwayCol3}>
                            {runway.width ? `${runway.width} ft` : '--'}
                          </Text>
                          <Text style={styles.runwayCol4}>{formatSurfaceType(runway.surfaceType)}</Text>
                          <Text style={styles.runwayCol5}>{runway.edgeLightIntensity || 'None'}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Frequencies */}
                {airportFrequencies.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>Frequencies</Text>
                    <View style={styles.table}>
                      <View style={styles.tableHeader}>
                        <Text style={styles.freqCol1}>Frequency</Text>
                        <Text style={styles.freqCol2}>Type/Name</Text>
                        <Text style={styles.freqCol3}>Remarks</Text>
                      </View>
                      {airportFrequencies.slice(0, 10).map((freq, idx) => (
                        <View
                          key={freq.id || idx}
                          style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                        >
                          <Text style={styles.freqCol1}>{freq.frequency || '--'}</Text>
                          <Text style={styles.freqCol2}>
                            {freq.frequencyUse || freq.towerOrCommCall || '--'}
                          </Text>
                          <Text style={styles.freqCol3}>{freq.remark || freq.sectorization || '--'}</Text>
                        </View>
                      ))}
                    </View>
                    {airportFrequencies.length > 10 && (
                      <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>
                        + {airportFrequencies.length - 10} more frequencies
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })}

          <Text style={styles.footer}>Generated by VFR3D</Text>
          <Text style={styles.pageNumber}>Page {pageNumber++}</Text>
        </Page>
      )}

      {/* Page 4: Weather (if available) */}
      {Object.keys(metars).length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>Weather Information</Text>
          {flightData.waypoints && <RouteDisplay waypoints={flightData.waypoints} />}

          {Object.entries(metars).map(([ident, metar]) => {
            const taf = tafs[ident];
            const isVariableWind = metar.windDirDegrees === 'VRB' || metar.windDirDegrees === 'Variable';

            return (
              <View key={ident} style={styles.weatherCard} wrap={false}>
                {/* Header with station ID and flight category */}
                <View style={styles.weatherHeader}>
                  <Text style={styles.weatherStationId}>{ident}</Text>
                  {metar.flightCategory && (
                    <View style={[styles.flightCategoryBadge, getFlightCategoryStyle(metar.flightCategory)]}>
                      <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>
                        {metar.flightCategory}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Raw METAR text */}
                <View style={styles.rawMetarBox}>
                  <Text style={styles.rawMetarText}>{metar.rawText || 'No METAR available'}</Text>
                </View>

                {/* Decoded METAR data grid */}
                <View style={styles.weatherGrid}>
                  {/* Wind */}
                  <View style={styles.weatherGridItem}>
                    <Text style={styles.weatherLabel}>Wind</Text>
                    <Text style={styles.weatherValueBold}>
                      {isVariableWind ? 'Variable' : formatWindDirection(metar.windDirDegrees)} @{' '}
                      {metar.windSpeedKt || '--'}kt
                      {metar.windGustKt && (
                        <Text style={styles.gustWarning}> G{metar.windGustKt}kt</Text>
                      )}
                    </Text>
                  </View>

                  {/* Visibility */}
                  <View style={styles.weatherGridItem}>
                    <Text style={styles.weatherLabel}>Visibility</Text>
                    <Text style={styles.weatherValue}>{formatVisibility(metar.visibilityStatuteMi)}</Text>
                  </View>

                  {/* Temperature / Dewpoint */}
                  <View style={styles.weatherGridItem}>
                    <Text style={styles.weatherLabel}>Temp / Dewpoint</Text>
                    <Text style={styles.weatherValue}>{formatTemperature(metar.tempC, metar.dewpointC)}</Text>
                  </View>

                  {/* Altimeter */}
                  <View style={styles.weatherGridItem}>
                    <Text style={styles.weatherLabel}>Altimeter</Text>
                    <Text style={styles.weatherValueBold}>{formatAltimeter(metar.altimInHg)}</Text>
                  </View>
                </View>

                {/* Sky Conditions */}
                {metar.skyCondition && metar.skyCondition.length > 0 && (
                  <View style={styles.skyConditionsBox}>
                    <Text style={styles.weatherLabel}>Sky Conditions</Text>
                    {metar.skyCondition.map((sky, idx) => (
                      <View key={idx} style={styles.skyConditionRow}>
                        <Text style={styles.weatherValue}>
                          {sky.skyCover}
                          {sky.cloudBaseFtAgl && ` @ ${sky.cloudBaseFtAgl.toLocaleString()} ft AGL`}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Weather Phenomena */}
                {metar.wxString && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.weatherLabel}>Weather Phenomena</Text>
                    <Text style={[styles.weatherValue, { fontWeight: 'bold' }]}>{metar.wxString}</Text>
                  </View>
                )}

                {/* Observation Time */}
                {metar.observationTime && (
                  <Text style={styles.observationTime}>
                    Observed: {new Date(metar.observationTime).toLocaleString()}
                  </Text>
                )}

                {/* TAF Section */}
                {taf && (
                  <>
                    <Text style={styles.tafTitle}>Terminal Aerodrome Forecast (TAF)</Text>

                    {/* Raw TAF */}
                    <View style={styles.rawMetarBox}>
                      <Text style={styles.rawMetarText}>{taf.rawText || 'No TAF available'}</Text>
                    </View>

                    {/* Validity Period */}
                    {(taf.validTimeFrom || taf.validTimeTo) && (
                      <Text style={styles.tafValidityText}>
                        Valid: {taf.validTimeFrom && new Date(taf.validTimeFrom).toLocaleString()} -{' '}
                        {taf.validTimeTo && new Date(taf.validTimeTo).toLocaleString()}
                      </Text>
                    )}

                    {/* Forecast Periods */}
                    {taf.forecast && taf.forecast.length > 0 && (
                      <View>
                        {taf.forecast.slice(0, 6).map((fcst: TafForecast, idx: number) => (
                          <View key={idx} style={styles.forecastPeriod}>
                            <View style={styles.forecastHeader}>
                              <Text style={styles.forecastChange}>
                                {getChangeIndicatorText(fcst.changeIndicator)}
                                {fcst.probability && ` (${fcst.probability}%)`}
                              </Text>
                              <Text style={styles.forecastTime}>
                                {formatForecastTime(fcst.fcstTimeFrom, fcst.fcstTimeTo)}
                              </Text>
                            </View>
                            <View style={styles.forecastDetails}>
                              {/* Wind */}
                              {(fcst.windDirDegrees || fcst.windSpeedKt) && (
                                <View style={styles.forecastItem}>
                                  <Text style={styles.weatherLabel}>Wind</Text>
                                  <Text style={styles.weatherValue}>
                                    {formatWindDirection(fcst.windDirDegrees)} @ {fcst.windSpeedKt || '--'}kt
                                    {fcst.windGustKt && <Text style={styles.gustWarning}> G{fcst.windGustKt}</Text>}
                                  </Text>
                                </View>
                              )}
                              {/* Visibility */}
                              {fcst.visibilityStatuteMi && (
                                <View style={styles.forecastItem}>
                                  <Text style={styles.weatherLabel}>Visibility</Text>
                                  <Text style={styles.weatherValue}>{formatVisibility(fcst.visibilityStatuteMi)}</Text>
                                </View>
                              )}
                              {/* Sky */}
                              {fcst.skyConditions && fcst.skyConditions.length > 0 && (
                                <View style={styles.forecastItem}>
                                  <Text style={styles.weatherLabel}>Sky</Text>
                                  <Text style={styles.weatherValue}>
                                    {formatSkyConditions(fcst.skyConditions)}
                                  </Text>
                                </View>
                              )}
                              {/* Weather */}
                              {fcst.wxString && (
                                <View style={styles.forecastItem}>
                                  <Text style={styles.weatherLabel}>Weather</Text>
                                  <Text style={styles.weatherValue}>{fcst.wxString}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        ))}
                        {taf.forecast.length > 6 && (
                          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>
                            + {taf.forecast.length - 6} more forecast periods
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Issue Time */}
                    {taf.issueTime && (
                      <Text style={styles.observationTime}>
                        Issued: {new Date(taf.issueTime).toLocaleString()}
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })}

          <Text style={styles.footer}>Generated by VFR3D</Text>
          <Text style={styles.pageNumber}>Page {pageNumber}</Text>
        </Page>
      )}
    </Document>
  );
};

export default FlightLogPdf;
