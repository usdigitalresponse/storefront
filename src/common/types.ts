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
  email: string;
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
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  deliveryPref_weekends: boolean;
  deliveryPref_weekdays: boolean;
  deliveryPref_mornings: boolean;
  deliveryPref_afternoons: boolean;
  deliveryPref_evenings: boolean;
}

export interface ICheckoutFormDataPickup {
  pickupLocationId: string;
}

export type CheckoutFormField =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'street1'
  | 'street2'
  | 'city'
  | 'state'
  | 'zip'
  | 'deliveryPref_weekends'
  | 'deliveryPref_weekdays'
  | 'deliveryPref_mornings'
  | 'deliveryPref_afternoons'
  | 'deliveryPref_evenings'
  | 'pickupLocationId';
export interface ICheckoutFormData extends ICheckoutFormDataDelivery, ICheckoutFormDataPickup {}

export interface IOrderSummary extends ICheckoutFormData {
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
  DELIVERY = 'Delivery',
  PICKUP = 'Pickup',
  DONATION = 'Donation',
}

export enum PaymentStatus {
  NONE = 'none',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  IN_PROGRESS = 'inProgress',
}

export interface IPickupLocation {
  id: string;
  name: string;
  address: IAddress;
  schedules: string[];
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export enum ScheduleType {
  PICKUP = 'Pickup',
  DELIVERY = 'Delivery',
}

export interface ISchedule {
  id: string;
  type: ScheduleType;
  start: string;
  end: string;
  day: Day;
}

export enum DiscountCodeType {
  PERCENT = 'Percent off',
  DOLLARS = 'Dollars off',
}

export interface IDiscountCode {
  id: string;
  code: string;
  amount: number;
  type: DiscountCodeType;
}
