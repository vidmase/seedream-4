
import type { ImageSize, ImageResolution } from './types';

export const API_BASE_URL = 'https://api.kie.ai/api/v1';

export const IMAGE_SIZE_OPTIONS: { value: ImageSize; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'square_hd', label: 'Square HD' },
  { value: 'portrait_4_3', label: 'Portrait (3:4)' },
  { value: 'portrait_16_9', label: 'Portrait (9:16)' },
  { value: 'landscape_4_3', label: 'Landscape (4:3)' },
  { value: 'landscape_16_9', label: 'Landscape (16:9)' },
];

export const IMAGE_RESOLUTION_OPTIONS: { value: ImageResolution; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export const DEFAULT_PROMPT = "";

export const DEFAULT_IMAGE_URL = "";
