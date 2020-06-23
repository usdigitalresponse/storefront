import { AirtableImage, IOrderIntent, IOrderItem, IPickupLocation, InventoryRecord, OrderType } from './types';

export function getImageUrl(image?: AirtableImage[]): string {
  return (image && image[0] && image[0].url) || '';
}

export function getProduct(id: string, inventory: InventoryRecord[]): InventoryRecord | undefined {
  return inventory.find((item) => item.id === id);
}

export function getPickupLocation(id: string, pickupLocations: IPickupLocation[]): IPickupLocation | undefined {
  return pickupLocations.find((item) => item.id === id);
}

export function getOrderItemsForOrderIntent(orderIntent: IOrderIntent, productList: InventoryRecord[]): IOrderItem[] {
  if (orderIntent.items.length === 1 && orderIntent.items[0].quantity === 1) {
    const itemId = orderIntent.items[0].id;
    const selectedItem = getProduct(itemId, productList)!;

    if (orderIntent.type === OrderType.PICKUP) {
      for (const item of productList) {
        if (item.name === selectedItem.name) {
          if (item.locations) {
            for (const location of item.locations) {
              if (orderIntent.pickupLocationId === location.id) {
                return [{ id: location.inventoryId, quantity: 1 }];
              }
            }
          }
        }
      }
    } else {
      for (const item of productList) {
        if (item.name === selectedItem.name) {
          if (item.zipcodes) {
            for (const stockZipcode of item.zipcodes) {
              if (stockZipcode.zipcodes.includes(orderIntent.zip!)) {
                return [{ id: stockZipcode.inventoryId, quantity: 1 }];
              }
            }
          }
        }
      }
    }
  }

  return orderIntent.items;
}
