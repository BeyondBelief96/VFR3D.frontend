import React, { useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Text } from '@mantine/core';
import {
  CgEnvelopePointDto,
  WeightBalanceCgResultDto,
  ArmUnits,
  WeightUnits,
  CgEnvelopeFormat,
} from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import { SURFACE, SURFACE_INNER, BORDER, COLOR_RGB } from '@/constants/surfaces';

interface CgEnvelopeChartProps {
  envelopePoints: CgEnvelopePointDto[];
  envelopeName?: string;
  envelopeFormat?: CgEnvelopeFormat;
  takeoffResult?: WeightBalanceCgResultDto | null;
  landingResult?: WeightBalanceCgResultDto | null;
  armUnits?: ArmUnits;
  weightUnits?: WeightUnits;
  height?: number;
}

export const CgEnvelopeChart: React.FC<CgEnvelopeChartProps> = ({
  envelopePoints,
  envelopeName,
  envelopeFormat = CgEnvelopeFormat.Arm,
  takeoffResult,
  landingResult,
  armUnits = ArmUnits.Inches,
  weightUnits = WeightUnits.Pounds,
  height = 300,
}) => {
  const armLabel = ARM_UNIT_LABELS[armUnits] || 'in';
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';
  const isMomentFormat = envelopeFormat === CgEnvelopeFormat.MomentDividedBy1000;
  const xAxisName = isMomentFormat ? `Moment÷1000 (${weightLabel}-${armLabel})` : `CG (${armLabel})`;

  // Helper to get X value based on format
  const getXValue = useCallback((point: CgEnvelopePointDto): number => {
    if (isMomentFormat) {
      return point.momentDividedBy1000 ?? 0;
    }
    return point.arm ?? 0;
  }, [isMomentFormat]);

  const getTakeoffX = useCallback((result: WeightBalanceCgResultDto): number => {
    if (isMomentFormat) {
      return (result.totalMoment ?? 0) / 1000;
    }
    return result.cgArm ?? 0;
  }, [isMomentFormat]);

  // Calculate chart bounds
  const bounds = useMemo(() => {
    const allPoints: { x: number; weight: number }[] = [
      ...envelopePoints.map(p => ({ x: getXValue(p), weight: p.weight || 0 })),
    ];

    if (takeoffResult) {
      allPoints.push({ x: getTakeoffX(takeoffResult), weight: takeoffResult.totalWeight || 0 });
    }
    if (landingResult) {
      allPoints.push({ x: getTakeoffX(landingResult), weight: landingResult.totalWeight || 0 });
    }

    if (allPoints.length === 0) {
      return { minX: 0, maxX: 100, minWeight: 0, maxWeight: 3000 };
    }

    const xValues = allPoints.map(p => p.x);
    const weights = allPoints.map(p => p.weight);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    const xPadding = (maxX - minX) * 0.1 || 5;
    const weightPadding = (maxWeight - minWeight) * 0.1 || 100;

    return {
      minX: minX - xPadding,
      maxX: maxX + xPadding,
      minWeight: Math.max(0, minWeight - weightPadding),
      maxWeight: maxWeight + weightPadding,
    };
  }, [envelopePoints, takeoffResult, landingResult, getXValue, getTakeoffX]);

  // Prepare data points for takeoff and landing markers
  const takeoffData = useMemo(() => {
    if (!takeoffResult) return [];
    return [{
      x: getTakeoffX(takeoffResult),
      weight: takeoffResult.totalWeight,
      name: 'Takeoff',
      isWithin: takeoffResult.isWithinEnvelope,
    }];
  }, [takeoffResult, getTakeoffX]);

  const landingData = useMemo(() => {
    if (!landingResult) return [];
    return [{
      x: getTakeoffX(landingResult),
      weight: landingResult.totalWeight,
      name: 'Landing',
      isWithin: landingResult.isWithinEnvelope,
    }];
  }, [landingResult, getTakeoffX]);

  // Convert envelope points to format for custom rendering
  const sortedEnvelopePoints = useMemo(() => {
    if (envelopePoints.length === 0) return [];
    return envelopePoints.map((p, index) => ({
      x: getXValue(p),
      weight: p.weight || 0,
      name: `Point ${index + 1}`,
      isEnvelopePoint: true,
    }));
  }, [envelopePoints, getXValue]);

  // Custom tooltip
  interface TooltipData {
    name?: string;
    x?: number;
    weight?: number;
    isEnvelopePoint?: boolean;
    isWithin?: boolean;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipData }> }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const isEnvelopePoint = data.isEnvelopePoint;

      return (
        <Box
          p="xs"
          style={{
            backgroundColor: SURFACE.POPOVER,
            border: `1px solid ${BORDER.DEFAULT}`,
            borderRadius: 'var(--mantine-radius-sm)',
          }}
        >
          {data.name && (
            <Text size="xs" c="white" fw={500}>
              {isEnvelopePoint ? `Envelope ${data.name}` : data.name}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {isMomentFormat ? 'Moment÷1000' : 'CG'}: {data.x?.toFixed(isMomentFormat ? 1 : 2)}{isMomentFormat ? '' : ` ${armLabel}`}
          </Text>
          <Text size="xs" c="dimmed">
            Weight: {data.weight?.toLocaleString()} {weightLabel}
          </Text>
          {data.isWithin !== undefined && (
            <Text size="xs" c={data.isWithin ? 'green' : 'red'}>
              {data.isWithin ? 'Within envelope' : 'Outside envelope'}
            </Text>
          )}
        </Box>
      );
    }
    return null;
  };

  if (envelopePoints.length === 0) {
    return (
      <Box
        h={height}
        style={{
          backgroundColor: SURFACE_INNER.DEFAULT,
          borderRadius: 'var(--mantine-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text c="dimmed" size="sm">No CG envelope data to display</Text>
      </Box>
    );
  }

  return (
    <Box>
      {envelopeName && (
        <Text size="sm" c="white" fw={500} mb="xs" ta="center">
          {envelopeName} Envelope
        </Text>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{ top: 10, right: 30, bottom: 45, left: 60 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisName}
            domain={[bounds.minX, bounds.maxX]}
            tickFormatter={(value) => value.toFixed(isMomentFormat ? 0 : 1)}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
            label={{
              value: xAxisName,
              position: 'insideBottom',
              offset: -5,
              fill: '#94a3b8',
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="weight"
            name={`Weight (${weightLabel})`}
            domain={[bounds.minWeight, bounds.maxWeight]}
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
            label={{
              value: `Weight (${weightLabel})`,
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fill: '#94a3b8',
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{
              color: '#94a3b8',
              fontSize: 11,
              paddingBottom: 10,
            }}
          />

          {/* Envelope boundary as scatter line */}
          <Scatter
            name="Envelope"
            data={[...sortedEnvelopePoints, sortedEnvelopePoints[0]]}
            line={{ stroke: `rgba(${COLOR_RGB.BLUE_500}, 0.6)`, strokeWidth: 2 }}
            fill={`rgba(${COLOR_RGB.BLUE_500}, 0.8)`}
            shape="circle"
            legendType="rect"
          />

          {/* Takeoff point */}
          {takeoffData.length > 0 && (
            <Scatter
              name="Takeoff"
              data={takeoffData}
              fill={takeoffData[0].isWithin ? '#22c55e' : '#ef4444'}
              shape="circle"
              legendType="circle"
            />
          )}

          {/* Landing point */}
          {landingData.length > 0 && (
            <Scatter
              name="Landing"
              data={landingData}
              fill={landingData[0].isWithin ? '#22c55e' : '#ef4444'}
              shape="diamond"
              legendType="diamond"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CgEnvelopeChart;
