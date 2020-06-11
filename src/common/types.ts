export interface IConfig {
  languages: string[];
  taxRate: number;
  projectName: string;
  defaultState?: string;
  themeColor: string;
  donationUnits?: string;
  deliveryPreferences: boolean;
  driverForm: boolean;
  driverFormId: string;
  driverFormName?: string;
}

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

export interface IOrderItem {
  id: string;
  quantity: number;
}

export interface IAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface ICheckoutFormBase {
  fullName: string;
  phone: string;
  email: string;
  optInComms: boolean;
  optInSubsidy: boolean;
  type: OrderType;
  eligible?: boolean;
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

export interface ICheckoutFormDataPickup extends ICheckoutFormBase {
  pickupLocationId?: string;
}

export type CheckoutFormField =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'optInComms'
  | 'optInSubsidy'
  | 'eligible'
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

export interface IOrderIntent extends ICheckoutFormData {
  status: OrderStatus;
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  items: IOrderItem[];
  discountCode?: string;
  stripePaymentId?: string;
}

export interface IOrderSummary extends ICheckoutFormBase {
  id: string;
  createdAt: string;
  status: OrderStatus;
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  items: IOrderItem[];
  stripePaymentId?: string;
  deliveryAddress?: IAddress;
  pickupLocationId?: string;
  deliveryPreferences?: string[];
}

export function isOrderSummary(confirmation?: IOrderSummary | IDonationSummary): confirmation is IOrderSummary {
  return !!confirmation && (confirmation as IOrderSummary).items !== undefined;
}

export type OrderStatus = 'Donation Requested' | 'Paid';

export type DonationFormField = 'fullName' | 'phone' | 'email' | 'otherAmount';

export interface IDonationFormData {
  fullName: string;
  phone: string;
  email: string;
  otherAmount: string;
}

export interface IDonationIntent extends IDonationFormData {
  amount: number;
  stripePaymentId: string;
}

export interface IDonationSummary {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  total: number;
  stripePaymentId: string;
}

export function isDonationSummary(confirmation?: IOrderSummary | IDonationSummary): confirmation is IDonationSummary {
  return !!confirmation && (confirmation as IOrderSummary).items === undefined;
}

export type StateMap = Record<string, string>;

export interface IProductRouteParams {
  id: string;
}

export enum OrderType {
  DELIVERY = 'Delivery',
  PICKUP = 'Pickup',
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
  schedules: Array<string | ISchedule>;
}

export function isSchedule(schedule?: string | ISchedule): schedule is ISchedule {
  return !!schedule && (schedule as ISchedule).id !== undefined;
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ISchedule {
  id: string;
  type: OrderType;
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

export type PaymentType = 'main' | 'donation';
