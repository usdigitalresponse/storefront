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
  amount: number;
  items: OrderItem[];
  stripePaymentId: string;
};

export interface IAddress {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

export interface ICheckoutFormBase {
  fullName: string;
  phone: string;
  email: string;
  type: OrderType;
}

export interface ICheckoutFormDataDelivery extends ICheckoutFormBase {
  scheduleId: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface ICheckoutFormDataPickup {
  scheduleId: string;
  pickupLocationId: string;
}

export interface ICheckoutFormData extends ICheckoutFormDataDelivery, ICheckoutFormDataPickup {}

export interface IOrderDetails extends ICheckoutFormData {
  amount: number;
  items: OrderItem[];
  stripePaymentId: string;
}

export type StateMap = Record<string, string>;
export type OrderItem = ICartItem;

export interface IProductRouteParams {
  id: string;
}

export enum OrderType {
  DELIVERY = 'devliery',
  PICKUP = 'pickup',
  DONATION = 'donation',
}
