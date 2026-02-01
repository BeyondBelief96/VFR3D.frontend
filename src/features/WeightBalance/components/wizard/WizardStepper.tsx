import { Stepper } from '@mantine/core';
import { FiSettings, FiUsers, FiCheckSquare, FiCheck } from 'react-icons/fi';
import { FaBalanceScale, FaChartArea } from 'react-icons/fa';
import { WIZARD_STEPS } from '../../constants/wizardContent';
import { useIsPhone } from '@/hooks';

interface WizardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canGoToStep: (step: number) => boolean;
}

const STEP_ICONS = [
  <FiSettings size={16} key="settings" />,
  <FaBalanceScale size={14} key="scale" />,
  <FiUsers size={16} key="users" />,
  <FaChartArea size={14} key="chart" />,
  <FiCheckSquare size={16} key="checklist" />,
];

export function WizardStepper({
  currentStep,
  onStepClick,
  canGoToStep,
}: WizardStepperProps) {
  const isPhone = useIsPhone();

  return (
    <Stepper
      active={currentStep}
      onStepClick={onStepClick}
      allowNextStepsSelect={false}
      size={isPhone ? 'xs' : 'sm'}
      color="blue"
      completedIcon={<FiCheck size={isPhone ? 12 : 14} />}
      orientation={isPhone ? 'vertical' : 'horizontal'}
      styles={isPhone ? {
        stepLabel: { fontSize: '0.75rem' },
        stepDescription: { display: 'none' },
        step: { padding: '4px 0' },
      } : undefined}
    >
      {WIZARD_STEPS.map((step, index) => (
        <Stepper.Step
          key={index}
          icon={STEP_ICONS[index]}
          label={step.label}
          description={isPhone ? undefined : step.description}
          allowStepSelect={canGoToStep(index)}
          color={index < currentStep ? 'teal' : index === currentStep ? 'blue' : 'gray'}
        />
      ))}
    </Stepper>
  );
}
