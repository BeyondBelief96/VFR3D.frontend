import { ArcGisMapServerImageryProvider, ImageryProvider } from 'cesium';
import { useEffect, useState } from 'react';

/**
 * Hook to load ArcGIS Map Server imagery providers asynchronously.
 * @param imageryUrl - The URL of the ArcGIS Map Server
 * @returns An object containing the loaded imagery provider (or null if loading/failed)
 */
export function useArcGisImageryProviders(imageryUrl: string) {
  const [imagery, setImagery] = useState<ImageryProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImagery = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const imageryProvider = await ArcGisMapServerImageryProvider.fromUrl(imageryUrl, {
          maximumLevel: 23,
        });

        if (isMounted) {
          setImagery(imageryProvider);
        }
      } catch (err) {
        console.error('Error loading ArcGIS imagery provider:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load imagery'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImagery();

    return () => {
      isMounted = false;
    };
  }, [imageryUrl]);

  return { imagery, isLoading, error };
}

export default useArcGisImageryProviders;
