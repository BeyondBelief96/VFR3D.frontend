import { useEffect } from 'react';
import { useCesium } from 'resium';
import { ScreenSpaceEventType, ScreenSpaceEventHandler } from 'cesium';

/**
 * Hook to disable the default double-click zoom behavior in Cesium.
 * This is useful when you want to use double-click for other purposes.
 */
export function useDisableDoubleClickZoom() {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    // Safety check for cesiumWidget
    if (!viewer.cesiumWidget || viewer.cesiumWidget.isDestroyed()) return;

    // Disable double-click zoom
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    // Prevent default behavior for double-click
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(() => {
      // Do nothing, effectively preventing the default zoom behavior
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer]);
}

export default useDisableDoubleClickZoom;
