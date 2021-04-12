import {
  AirtableImage,
  IOrderIntent,
  IOrderItem,
  IPickupLocation,
  InventoryRecord,
  OrderType,
  Question,
} from './types';

export function getImageUrl(image?: AirtableImage[]): string {
  return (image && image[0] && image[0].url) || '';
}

export function getProduct(id: string, inventory: InventoryRecord[]): InventoryRecord | undefined {
  return inventory.find((item) => item.id === id);
}

export function getPickupLocation(id: string, pickupLocations: IPickupLocation[]): IPickupLocation | undefined {
  return pickupLocations.find((item) => item.id === id);
}

export function getLanguageName(id: string): string {
  switch (id) {
    case 'es':
      return 'Español';
    case 'en':
    default:
      return 'English';
  }
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

export function inventoryForLanguage(inventory: InventoryRecord[], language: string): InventoryRecord[] {
  return inventory.map((item) => ({
    ...item,
    ...(item.strings && item.strings[language] && item.strings[language].name
      ? { name: item.strings[language].name }
      : {}),
    ...(item.strings && item.strings[language] && item.strings[language].description
      ? { description: item.strings[language].description }
      : {}),
  }));
}

export function questionForLanguage(questions: Question[], language: string): Question[] {
  return questions.map((question) => {
    if( question.markdownLabel?.length > 0 ) {
      let text
      if( question && question.strings ) {
        text = question.strings[language]
      }
      console.log("language, question", language, question.strings)
      console.log("text", text)
    }
    return {
    ...question,
      ...(question.strings && question.strings[language] && (question.strings[language].label || question.strings[language].markdownLabel )
        ? { label: question.strings[language].label, markdownLabel: question.strings[language].markdownLabel }
      : {}),
    ...(question.strings && question.strings[language] && question.strings[language].options
      ? { options: question.strings[language].options }
      : {}),
    }
  });
}
