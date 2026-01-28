import React, { useMemo } from 'react';
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

  // Calculate chart bounds
  const bounds = useMemo(() => {
    const allPoints: { arm: number; weight: number }[] = [
      ...envelopePoints.map(p => ({ arm: p.arm || 0, weight: p.weight || 0 })),
    ];

    if (takeoffResult) {
      allPoints.push({ arm: takeoffResult.cgArm || 0, weight: takeoffResult.totalWeight || 0 });
    }
    if (landingResult) {
      allPoints.push({ arm: landingResult.cgArm || 0, weight: landingResult.totalWeight || 0 });
    }

    if (allPoints.length === 0) {
      return { minArm: 0, maxArm: 100, minWeight: 0, maxWeight: 3000 };
    }

    const arms = allPoints.map(p => p.arm);
    const weights = allPoints.map(p => p.weight);

    const minArm = Math.min(...arms);
    const maxArm = Math.max(...arms);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    const armPadding = (maxArm - minArm) * 0.1 || 5;
    const weightPadding = (maxWeight - minWeight) * 0.1 || 100;

    return {
      minArm: minArm - armPadding,
      maxArm: maxArm + armPadding,
      minWeight: Math.max(0, minWeight - weightPadding),
      maxWeight: maxWeight + weightPadding,
    };
  }, [envelopePoints, takeoffResult, landingResult]);

  // Prepare data points for takeoff and landing markers
  const takeoffData = useMemo(() => {
    if (!takeoffResult) return [];
    return [{
      arm: takeoffResult.cgArm,
      weight: takeoffResult.totalWeight,
      name: 'Takeoff',
      isWithin: takeoffResult.isWithinEnvelope,
    }];
  }, [takeoffResult]);

  const landingData = useMemo(() => {
    if (!landingResult) return [];
    return [{
      arm: landingResult.cgArm,
      weight: landingResult.totalWeight,
      name: 'Landing',
      isWithin: landingResult.isWithinEnvelope,
    }];
  }, [landingResult]);

  // Convert envelope points to format for custom rendering
  const sortedEnvelopePoints = useMemo(() => {
    if (envelopePoints.length === 0) return [];
    return envelopePoints.map(p => ({
      arm: p.arm || 0,
      weight: p.weight || 0,
    }));
  }, [envelopePoints]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <Box
          p="xs"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 'var(--mantine-radius-sm)',
          }}
        >
          {data.name && (
            <Text size="xs" c="white" fw={500}>{data.name}</Text>
          )}
          <Text size="xs" c="dimmed">
            {isMomentFormat ? 'Moment÷1000' : 'CG'}: {data.arm?.toFixed(isMomentFormat ? 1 : 2)} {isMomentFormat ? '' : armLabel}
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
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis
            type="number"
            dataKey="arm"
            name={xAxisName}
            domain={[bounds.minArm, bounds.maxArm]}
            tickFormatter={(value) => value.toFixed(isMomentFormat ? 0 : 1)}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
            label={{
              value: xAxisName,
              position: 'bottom',
              offset: 0,
              fill: '#94a3b8',
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="weight"
            name={`Weight (${weightLabel})`}
            domain={[bounds.minWeight, bounds.maxWeight]}
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
            label={{
              value: `Weight (${weightLabel})`,
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
          />

          {/* Envelope boundary as scatter line */}
          <Scatter
            name="Envelope"
            data={[...sortedEnvelopePoints, sortedEnvelopePoints[0]]}
            line={{ stroke: 'rgba(59, 130, 246, 0.6)', strokeWidth: 2 }}
            fill="rgba(59, 130, 246, 0.15)"
            shape={() => null}
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
              fill={landingData[0].isWithin ? '#3b82f6' : '#ef4444'}
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
