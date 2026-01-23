import { PirepDto } from '@/redux/api/vfr3d/dtos';
import { mapPirepToCartesian3 } from '@/utility/cesiumUtils';
import { NearFarScalar } from 'cesium';
import pirepSymbol from '@/assets/images/pirepsymbol.png';
import { BillboardEntity } from '@/components/Cesium';

interface PirepEntityProps {
  pirep: PirepDto;
}

export const PirepEntity: React.FC<PirepEntityProps> = ({ pirep }) => {
  if (!pirep) return null;
  const position = mapPirepToCartesian3(pirep);
  return position ? (
    <BillboardEntity
      image={pirepSymbol}
      id={pirep.id?.toString() ?? ''}
      position={position}
      scaleByDistance={new NearFarScalar(1000000, 0.07, 5000000, 0.05)}
    />
  ) : null;
};
