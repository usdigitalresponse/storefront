import { AirtableImage, InventoryRecord } from './types';

export function getImageUrl(image?: AirtableImage[]): string {
  return (image && image[0] && image[0].url) || '';
}

export function getProduct(id: string, inventory: InventoryRecord[]): InventoryRecord | undefined {
  return inventory.find(item => item.id === id);
}
