import { Stepper } from '@mantine/core';
import { FiSettings, FiUsers, FiCheckSquare, FiCheck } from 'react-icons/fi';
import { FaBalanceScale, FaChartArea } from 'react-icons/fa';
import { WIZARD_STEPS } from '../../constants/wizardContent';

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
  return (
    <Stepper
      active={currentStep}
      onStepClick={onStepClick}
      allowNextStepsSelect={false}
      size="sm"
      color="blue"
      completedIcon={<FiCheck size={14} />}
    >
      {WIZARD_STEPS.map((step, index) => (
        <Stepper.Step
          key={index}
          icon={STEP_ICONS[index]}
          label={step.label}
          description={step.description}
          allowStepSelect={canGoToStep(index)}
          color={index < currentStep ? 'teal' : index === currentStep ? 'blue' : 'gray'}
        />
      ))}
    </Stepper>
  );
}
