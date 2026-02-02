import React from 'react';
import { CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';
import { FrequencyTable } from '@/components/Frequencies';

interface FrequencyInformationProps {
  frequencies: CommunicationFrequencyDto[] | undefined;
}

export const FrequencyInformation: React.FC<FrequencyInformationProps> = ({ frequencies }) => {
  return (
    <FrequencyTable
      frequencies={frequencies}
      variant="compact"
      showGroupHeader={true}
      showGroupPaper={false}
    />
  );
};

export default FrequencyInformation;
