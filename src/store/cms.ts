import { CMSRecord } from '../common/types';
import { IAppState } from './app';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { Stripe, loadStripe } from '@stripe/stripe-js';

// model
export interface ICmsState {
  records: Record<string, CMSRecord>;
  inventory: Record<string, CMSRecord>;
  languages: string[];
  language: string;
  stripePromise: Promise<Stripe | null> | null;
}

// actions
export const SetRecords = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetLanguages = TypedAction.define('APP/CMS/SET_LANGUAGES')<any>();
export const SetStripePromise = TypedAction.define('APP/CMS/SET_STRIPE_PROMISE')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetRecords.TYPE, (state, records) => setWith(state, { records }))
  .withHandler(SetLanguages.TYPE, (state, languages) => setWith(state, { languages }))
  .withHandler(SetStripePromise.TYPE, (state, stripePublicKey) =>
    setWith(state, { stripePromise: loadStripe(stripePublicKey) }),
  )
  .withDefaultHandler((state) => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  records: {},
  inventory: {},
  stripePromise: null,
  languages: ['en'],
  language: 'en',
};

// utils
export function cmsValueForKeySelector(key: string) {
  return (state: IAppState): string => {
    const { records, language } = state.cms;

    const value: CMSRecord = records[key];

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

export function cmsInventory() {
  return (state: IAppState): any => {
    const { inventory } = state;
    return inventory;
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
