import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Badge,
  SimpleGrid,
  Button,
  Select,
  Paper,
  Group,
  Loader,
  Anchor,
  Image,
} from '@mantine/core';
import { FiCloud } from 'react-icons/fi';
import { IMAGERY_PRODUCTS } from '@/utility/constants';
import { ImageryProduct } from '@/utility/types';
import classes from './weather-imagery.module.css';
import { THEME_COLORS } from '@/constants/surfaces';

export const Route = createFileRoute('/weather-imagery')({
  component: WeatherSupportImageryPage,
});

function WeatherSupportImageryPage() {
  const [selectedProduct, setSelectedProduct] = useState<ImageryProduct | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const constructImageUrl = useCallback(() => {
    if (!selectedProduct) return '';

    const hasAllRequiredFilters = (requiredFilters: string[]) => {
      return requiredFilters.every((filter) => selectedFilters[filter]);
    };

    switch (selectedProduct.id) {
      case 'gairmet':
        if (!hasAllRequiredFilters(['hour', 'type', 'region'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour}_gairmet_${selectedFilters.type.toLowerCase()}_${selectedFilters.region.toLowerCase()}.${selectedProduct.fileExtension}`;

      case 'sigmet':
        if (!hasAllRequiredFilters(['type'])) return '';
        return `${selectedProduct.baseUrl}/sigmet_${selectedFilters.type.toLowerCase()}.${selectedProduct.fileExtension}`;

      case 'wpc_prog':
        if (!hasAllRequiredFilters(['hour'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour}_wpc_${selectedFilters.hour === '000' ? 'sfc' : 'prog'}.${selectedProduct.fileExtension}`;

      case 'sigwx_low':
        if (!hasAllRequiredFilters(['hour'])) return '';
        return `${selectedProduct.baseUrl}/${selectedFilters.hour}_sigwx_lo_us.${selectedProduct.fileExtension}`;

      case 'sigwx_mid':
        if (!hasAllRequiredFilters(['hour'])) return '';
        return `${selectedProduct.baseUrl}/${selectedFilters.hour}_sigwx_mid_nat.${selectedProduct.fileExtension}`;

      case 'sigwx_high':
        if (!hasAllRequiredFilters(['hour', 'area'])) return '';
        return `${selectedProduct.baseUrl}/${selectedFilters.hour}_sigwx_hi_${selectedFilters.area}.${selectedProduct.fileExtension}`;

      case 'turbulence':
        if (!hasAllRequiredFilters(['hour', 'level', 'field'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour}_gtg_${selectedFilters.level.toLowerCase()}_${selectedFilters.field.toLowerCase()}.${selectedProduct.fileExtension}`;

      case 'icing':
        if (!hasAllRequiredFilters(['hour', 'level', 'field'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour}_fip_${selectedFilters.level.toLowerCase()}_${selectedFilters.field.toLowerCase()}.${selectedProduct.fileExtension}`;

      case 'gfa':
        if (!hasAllRequiredFilters(['hour', 'type', 'region'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour}_gfa_${selectedFilters.type.toLowerCase()}_${selectedFilters.region.toLowerCase()}.${selectedProduct.fileExtension}`;

      case 'tfm_gate':
        if (!hasAllRequiredFilters(['city'])) return '';
        return `${selectedProduct.baseUrl}?arpt=${selectedFilters.city}`;

      case 'tcf':
        if (!hasAllRequiredFilters(['hour'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour.toLowerCase()}_tcf.${selectedProduct.fileExtension}`;

      case 'etcf':
        if (!hasAllRequiredFilters(['hour'])) return '';
        return `${selectedProduct.baseUrl}/F${selectedFilters.hour.toLowerCase()}_etcf.${selectedProduct.fileExtension}`;

      default:
        return '';
    }
  }, [selectedProduct, selectedFilters]);

  useEffect(() => {
    if (selectedProduct) {
      const url = constructImageUrl();
      if (url) {
        setIsLoading(true);
        setHasError(false);
        setImageUrl(url);
      }
    }
  }, [constructImageUrl, selectedProduct]);

  const handleProductSelect = (product: ImageryProduct) => {
    setSelectedProduct(product);
    setSelectedFilters({});
    setImageUrl('');
    setHasError(false);
  };

  const handleFilterChange = (filterName: string, value: string | null) => {
    if (value) {
      setSelectedFilters((prev) => ({
        ...prev,
        [filterName]: value,
      }));
    }
  };

  const formatFilterLabel = (filterName: string): string => {
    const labels: { [key: string]: string } = {
      type: 'Type',
      region: 'Region',
      hour: 'Forecast Hour',
      area: 'Area',
      level: 'Altitude Level',
      field: 'Field Type',
      city: 'Airport',
    };
    return labels[filterName] || filterName.charAt(0).toUpperCase() + filterName.slice(1);
  };

  return (
    <Box className={classes.pageWrapper}>
      <Container size="lg" py={60}>
        <Stack gap="xl">
          {/* Header */}
          <Stack align="center" gap="md">
            <Badge size="lg" variant="light" color="blue" leftSection={<FiCloud size={14} />}>
              Weather
            </Badge>
            <Title order={1} c="white" ta="center">
              Weather Decision Support Imagery
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={600}>
              Access official aviation weather products from AviationWeather.gov to support your
              flight planning decisions.
            </Text>
          </Stack>

          {/* Product Selection */}
          <Paper p="lg" radius="md" className={classes.sectionPaper}>
            <Stack gap="md">
              <Text c="white" fw={600} size="sm">
                Select Product
              </Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="sm">
                {IMAGERY_PRODUCTS.map((product) => (
                  <Button
                    key={product.id}
                    variant={selectedProduct?.id === product.id ? 'filled' : 'outline'}
                    color={selectedProduct?.id === product.id ? 'blue' : 'gray'}
                    size="sm"
                    onClick={() => handleProductSelect(product)}
                  >
                    {product.name}
                  </Button>
                ))}
              </SimpleGrid>
            </Stack>
          </Paper>

          {/* Filter Selection */}
          {selectedProduct && selectedProduct.filters && (
            <Paper p="lg" radius="md" className={classes.sectionPaper}>
              <Stack gap="md">
                <Text c="white" fw={600} size="sm">
                  Configure Filters for {selectedProduct.name}
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {Object.entries(selectedProduct.filters).map(([filterName, options]) => (
                    <Select
                      key={filterName}
                      label={formatFilterLabel(filterName)}
                      placeholder={`Select ${formatFilterLabel(filterName).toLowerCase()}`}
                      data={options?.map((option) => ({ value: option, label: option })) || []}
                      value={selectedFilters[filterName] || null}
                      onChange={(value) => handleFilterChange(filterName, value)}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>
          )}

          {/* Image Display */}
          {imageUrl && (
            <Paper
              radius="md"
              className={`${classes.sectionPaper} ${classes.imagePaperOverflow}`}
            >
              <Box pos="relative" mih={isLoading ? 300 : undefined}>
                {isLoading && (
                  <Box
                    pos="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    className={classes.imageLoaderOverlay}
                  >
                    <Loader color="blue" size="lg" />
                  </Box>
                )}
                {hasError ? (
                  <Box p="xl" ta="center">
                    <Text c="red" size="sm">
                      Failed to load image. The requested product may not be available at this time.
                    </Text>
                  </Box>
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`${selectedProduct?.name} Weather Imagery`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                    w="100%"
                    display="block"
                  />
                )}
              </Box>
              <Group justify="space-between" p="md" className={classes.imageFooter}>
                <Stack gap={2}>
                  <Text c="white" fw={600}>
                    {selectedProduct?.name} Imagery
                  </Text>
                  <Text c="dimmed" size="sm">
                    Source:{' '}
                    <Anchor
                      href="https://aviationweather.gov/graphics/"
                      target="_blank"
                      rel="noopener noreferrer"
                      c="blue"
                      size="sm"
                    >
                      AviationWeather.gov
                    </Anchor>
                  </Text>
                </Stack>
                {Object.keys(selectedFilters).length > 0 && (
                  <Group gap="xs">
                    {Object.entries(selectedFilters).map(([key, value]) => (
                      <Badge key={key} variant="light" color="blue" size="sm">
                        {formatFilterLabel(key)}: {value}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Group>
            </Paper>
          )}

          {/* Help text when no product selected */}
          {!selectedProduct && (
            <Paper p="xl" radius="md" ta="center" className={classes.emptyStatePaper}>
              <Stack align="center" gap="md">
                <FiCloud size={48} color={THEME_COLORS.TEXT_DIMMED} />
                <Text c="dimmed" size="sm">
                  Select a weather product above to view imagery
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Help text when product selected but filters incomplete */}
          {selectedProduct && !imageUrl && (
            <Paper p="xl" radius="md" ta="center" className={classes.emptyStatePaper}>
              <Stack align="center" gap="md">
                <FiCloud size={48} color={THEME_COLORS.TEXT_DIMMED} />
                <Text c="dimmed" size="sm">
                  Configure all filters above to load the imagery
                </Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
