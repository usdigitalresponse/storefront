import { AirtableImage } from './types';

export function getImageUrl(image?: AirtableImage[]): string {
  return (image && image[0] && image[0].url) || '';
}
