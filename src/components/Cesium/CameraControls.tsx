import { useCallback, useEffect, useState } from 'react';
import { useCesium } from 'resium';
import { ActionIcon, Divider, Group, Paper, Tooltip } from '@mantine/core';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { TbArrowRight, TbArrowLeft, TbArrowUp, TbArrowDown, TbTarget } from 'react-icons/tb';
import { Math as CesiumMath, Cartographic } from 'cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import { FlightDisplayMode } from '@/utility/enums';
import { LayerTogglePopover } from './LayerTogglePopover';
import classes from './CameraControls.module.css';

/**
 * CameraControls component provides UI controls for navigating the Cesium viewer.
 * Includes zoom in/out, rotate left/right, look up/down, and recenter camera.
 */
export function CameraControls() {
  const { camera, scene } = useCesium();
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [isRotatingUp, setIsRotatingUp] = useState(false);
  const [isRotatingDown, setIsRotatingDown] = useState(false);

  const displayMode = useAppSelector((state) => state.flightPlanning.displayMode);
  const showLayerToggle =
    displayMode === FlightDisplayMode.VIEWING || displayMode === FlightDisplayMode.PREVIEW;

  const calculateZoomAmount = useCallback(() => {
    if (camera && scene) {
      const cameraPosition = camera.positionCartographic;
      const surfaceHeight = scene.globe.getHeight(cameraPosition) || 0;
      const heightAboveSurface = cameraPosition.height - surfaceHeight;

      const minZoomAmount = 10;
      const maxZoomAmount = 1000000;
      const zoomFactor = 0.3;

      return Math.max(minZoomAmount, Math.min(maxZoomAmount, heightAboveSurface * zoomFactor));
    }
    return 100000;
  }, [camera, scene]);

  const zoomIn = useCallback(() => {
    if (camera) {
      const zoomAmount = calculateZoomAmount();
      camera.zoomIn(zoomAmount);
    }
  }, [camera, calculateZoomAmount]);

  const zoomOut = useCallback(() => {
    if (camera) {
      const zoomAmount = calculateZoomAmount();
      camera.zoomOut(zoomAmount);
    }
  }, [camera, calculateZoomAmount]);

  const rotateLeft = useCallback(() => {
    if (camera) {
      camera.rotate(camera.position, -CesiumMath.PI / 180);
    }
  }, [camera]);

  const rotateRight = useCallback(() => {
    if (camera) {
      camera.rotate(camera.position, CesiumMath.PI / 180);
    }
  }, [camera]);

  const rotateUp = useCallback(() => {
    if (camera) {
      const pitch = camera.pitch;
      if (pitch < CesiumMath.PI_OVER_TWO - CesiumMath.EPSILON5) {
        camera.lookUp(CesiumMath.PI / 180);
      }
    }
  }, [camera]);

  const rotateDown = useCallback(() => {
    if (camera) {
      const pitch = camera.pitch;
      if (pitch > -CesiumMath.PI_OVER_TWO + CesiumMath.EPSILON5) {
        camera.lookDown(CesiumMath.PI / 180);
      }
    }
  }, [camera]);

  const recenterCamera = useCallback(() => {
    if (camera && scene) {
      const currentPosition = camera.positionCartographic;
      const newPosition = Cartographic.fromRadians(
        currentPosition.longitude,
        currentPosition.latitude,
        currentPosition.height
      );
      camera.flyTo({
        destination: scene.globe.ellipsoid.cartographicToCartesian(newPosition),
        orientation: {
          heading: 0.0,
          pitch: -CesiumMath.PI_OVER_TWO,
          roll: 0.0,
        },
        duration: 1.0,
      });
    }
  }, [camera, scene]);

  // Handle continuous rotation while button is held
  useEffect(() => {
    let rotationInterval: NodeJS.Timeout | null = null;

    if (isRotatingLeft) {
      rotationInterval = setInterval(rotateLeft, 16);
    } else if (isRotatingRight) {
      rotationInterval = setInterval(rotateRight, 16);
    } else if (isRotatingUp) {
      rotationInterval = setInterval(rotateUp, 16);
    } else if (isRotatingDown) {
      rotationInterval = setInterval(rotateDown, 16);
    }

    return () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
      }
    };
  }, [
    isRotatingLeft,
    isRotatingRight,
    isRotatingUp,
    isRotatingDown,
    rotateLeft,
    rotateRight,
    rotateUp,
    rotateDown,
  ]);

  return (
    <Paper shadow="lg" radius="md" p={4} className={classes.container}>
      <Group gap={4}>
        <Tooltip label="Zoom In" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={zoomIn}
            classNames={{ root: classes.actionButton }}
          >
            <FiPlus size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Zoom Out" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={zoomOut}
            classNames={{ root: classes.actionButton }}
          >
            <FiMinus size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Rotate Left" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onMouseDown={() => setIsRotatingLeft(true)}
            onMouseUp={() => setIsRotatingLeft(false)}
            onMouseLeave={() => setIsRotatingLeft(false)}
            onTouchStart={() => setIsRotatingLeft(true)}
            onTouchEnd={() => setIsRotatingLeft(false)}
            classNames={{ root: classes.actionButton }}
          >
            <TbArrowLeft size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Rotate Right" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onMouseDown={() => setIsRotatingRight(true)}
            onMouseUp={() => setIsRotatingRight(false)}
            onMouseLeave={() => setIsRotatingRight(false)}
            onTouchStart={() => setIsRotatingRight(true)}
            onTouchEnd={() => setIsRotatingRight(false)}
            classNames={{ root: classes.actionButton }}
          >
            <TbArrowRight size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Look Up" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onMouseDown={() => setIsRotatingUp(true)}
            onMouseUp={() => setIsRotatingUp(false)}
            onMouseLeave={() => setIsRotatingUp(false)}
            onTouchStart={() => setIsRotatingUp(true)}
            onTouchEnd={() => setIsRotatingUp(false)}
            classNames={{ root: classes.actionButton }}
          >
            <TbArrowUp size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Look Down" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onMouseDown={() => setIsRotatingDown(true)}
            onMouseUp={() => setIsRotatingDown(false)}
            onMouseLeave={() => setIsRotatingDown(false)}
            onTouchStart={() => setIsRotatingDown(true)}
            onTouchEnd={() => setIsRotatingDown(false)}
            classNames={{ root: classes.actionButton }}
          >
            <TbArrowDown size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Recenter Camera" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={recenterCamera}
            classNames={{ root: classes.actionButton }}
          >
            <TbTarget size={18} />
          </ActionIcon>
        </Tooltip>

        {showLayerToggle && (
          <>
            <Divider orientation="vertical" className={classes.divider} />
            <LayerTogglePopover />
          </>
        )}
      </Group>
    </Paper>
  );
}

export default CameraControls;
