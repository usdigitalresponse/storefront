export interface IContentRecord extends Record<string, string | AirtableImage[]> {
  en: string;
  en_es: string;
  image: AirtableImage[];
}

export interface InventoryRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  image: AirtableImage[];
}

export interface AirtableImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  width: number;
  height: number;
  thumbnails: {
    small: AirtableImageThumbnail;
    large: AirtableImageThumbnail;
  };
}

export interface AirtableImageThumbnail {
  url: string;
  height: number;
  width: number;
}

export interface IRoute {
  path: string;
  component: React.FC;
}

export interface INavItem {
  name: string;
  url: string;
}

export interface ICartItem {
  id: string;
  quantity: number;
}

export type Order = {
  fullName: string;
  deliveryAddress: string;
  stripePaymentId: string;
  amount: number;
  items: OrderItem[];
};

export type OrderItem = {
  quantity: number;
  inventoryId: string;
};

export interface IProductRouteParams {
  id: string;
}

export enum OrderType {
  DELIVERY = 'devliery',
  PICKUP = 'pickup',
}
