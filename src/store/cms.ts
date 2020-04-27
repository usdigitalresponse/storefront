import { CMSRecord, InventoryRecord } from '../common/types';
import { IAppState } from './app';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICmsState {
  cmsRecords: Record<string, CMSRecord>;
  inventoryItems: InventoryRecord[];
  languages: string[];
  language: string;
  stripePromise: Promise<Stripe | null> | null;
}

// actions
export const SetRecords = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetInventory = TypedAction.define('APP/CMS/SET_INVENTORY')<any>();
export const SetLanguages = TypedAction.define('APP/CMS/SET_LANGUAGES')<any>();
export const SetStripePromise = TypedAction.define('APP/CMS/SET_STRIPE_PROMISE')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetRecords.TYPE, (state, cmsRecords) => setWith(state, { cmsRecords }))
  .withHandler(SetLanguages.TYPE, (state, languages) => setWith(state, { languages }))
  .withHandler(SetInventory.TYPE, (state, inventoryItems) => setWith(state, { inventoryItems }))
  .withHandler(SetStripePromise.TYPE, (state, stripePublicKey) =>
    setWith(state, { stripePromise: loadStripe(stripePublicKey) }),
  )
  .withDefaultHandler((state) => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  cmsRecords: {},
  inventoryItems: [],
  stripePromise: null,
  languages: ['en'],
  language: 'en',
};

// utils
export function cmsValueForKeySelector(key: string) {
  return (state: IAppState): string => {
    const { cmsRecords, language } = state.cms;
    if (!cmsRecords) {
      console.error(`CMS data not loaded`);
      return '';
    }

    const value: CMSRecord = cmsRecords[key];

    if (!value) {
      console.error(`Missing ${key} value in CMS`);
      return '';
    }
    if (value.image) {
      return value.image[0]?.url;
    }

    return getRecordValueForLanguage(value, language);
  };
}

export function getStripePromise() {
  return (state: IAppState): PromiseLike<Stripe | null> | null => {
    if (!state.cms.stripePromise) {
      return null;
    }
    return state.cms.stripePromise;
  };
}

export function getRecordValueForLanguage(record: CMSRecord, language: string) {
  return record[language] as string;
}

export function getInventoryItems() {
  return (state: IAppState): InventoryRecord[] => {
    return state.cms.inventoryItems;
  };
}
