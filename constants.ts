
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

export const DEFAULT_PROMPT = "Refer to this logo and create a single visual showcase for an outdoor sports brand named ‘KIE AI’. Display five branded items together in one image: a packaging bag, a hat, a carton box, a wristband, and a lanyard. Use blue as the main visual color, with a fun, simple, and modern style.";

export const DEFAULT_IMAGE_URL = "https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png";
