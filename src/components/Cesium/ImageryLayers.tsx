import { ImageryLayer } from 'resium';
import { TextureMagnificationFilter, TextureMinificationFilter } from 'cesium';
import { useArcGisImageryProviders } from '@/hooks/useArcGisImageryProviders';
import { useAppSelector } from '@/hooks/reduxHooks';
import {
  ARCGIS_FAA_IFR_HIGH_URL,
  ARCGIS_FAA_IFR_LOW_URL,
  ARCGIS_FAA_VFR_SECTIONAL_URL,
  ARCGIS_FAA_VFR_TERMINAL_URL,
} from '@/utility/constants';

/**
 * ImageryLayers component renders FAA aviation chart layers on the Cesium globe.
 * Supports VFR Sectional, VFR Terminal, IFR Low, and IFR High charts.
 * Layer visibility is controlled by Redux state.
 */
export function ImageryLayers() {
  const { currentImageryAlpha, currentImageryBrightness, selectedImageryLayer } = useAppSelector(
    (state) => state.viewer
  );

  // Load all imagery providers
  const { imagery: vfrImagery } = useArcGisImageryProviders(ARCGIS_FAA_VFR_SECTIONAL_URL);
  const { imagery: vfrTerminal } = useArcGisImageryProviders(ARCGIS_FAA_VFR_TERMINAL_URL);
  const { imagery: ifrLowImagery } = useArcGisImageryProviders(ARCGIS_FAA_IFR_LOW_URL);
  const { imagery: ifrHighImagery } = useArcGisImageryProviders(ARCGIS_FAA_IFR_HIGH_URL);

  const commonImageryLayerProps = {
    alpha: currentImageryAlpha ?? 1,
    brightness: currentImageryBrightness ?? 1,
    magnificationFilter: TextureMagnificationFilter.NEAREST,
    minificationFilter: TextureMinificationFilter.NEAREST,
    cutoutRectangle: undefined,
  };

  return (
    <>
      {vfrImagery && (
        <ImageryLayer
          {...commonImageryLayerProps}
          imageryProvider={vfrImagery}
          show={selectedImageryLayer === 'vfrImagery'}
        />
      )}
      {vfrTerminal && (
        <ImageryLayer
          {...commonImageryLayerProps}
          imageryProvider={vfrTerminal}
          show={selectedImageryLayer === 'vfrTerminal'}
        />
      )}
      {ifrLowImagery && (
        <ImageryLayer
          {...commonImageryLayerProps}
          imageryProvider={ifrLowImagery}
          show={selectedImageryLayer === 'ifrLowImagery'}
        />
      )}
      {ifrHighImagery && (
        <ImageryLayer
          {...commonImageryLayerProps}
          imageryProvider={ifrHighImagery}
          show={selectedImageryLayer === 'ifrHighImagery'}
        />
      )}
    </>
  );
}

export default ImageryLayers;
