import * as Reselect from 'reselect';
import { IAppState } from './app';
import { IContentRecord, IPickupLocation, ISchedule, InventoryRecord } from '../common/types';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// model
export interface ICmsState {
  content: Record<string, IContentRecord>;
  inventory: InventoryRecord[];
  languages: string[];
  language: string;
  stripeObjects: {
    main: Promise<Stripe | null> | null;
    donation: Promise<Stripe | null> | null;
  };
  taxRate: number;
  defaultState?: string;
  donationUnits?: string;
  pickupLocations: IPickupLocation[];
  schedules: ISchedule[];
  donationPresets: number[];
  themeColor: string;
}

// actions
export const SetContent = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetInventory = TypedAction.define('APP/CMS/SET_INVENTORY')<any>();
export const SetLanguages = TypedAction.define('APP/CMS/SET_LANGUAGES')<any>();
export const SetTaxRate = TypedAction.define('APP/CMS/SET_TAX_RATE')<any>();
export const SetThemeColor = TypedAction.define('APP/CMS/SET_THEME_COLOR')<any>();
export const SetDonationPresets = TypedAction.define('APP/CMS/SET_DONATION_PRESETS')<any>();
export const SetDonationUnits = TypedAction.define('APP/CMS/SET_DONATION_UNITS')<any>();
export const SetDefaultState = TypedAction.define('APP/CMS/SET_DEFAULT_STATE')<any>();
export const SetSchedules = TypedAction.define('APP/CMS/SET_SCHEDULES')<any>();
export const SetPickupLocations = TypedAction.define('APP/CMS/SET_PICKUP_LOCATIONS')<any>();
export const SetStripePromise = TypedAction.define('APP/CMS/SET_STRIPE_PROMISE')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetContent.TYPE, (state, content) => setWith(state, { content }))
  .withHandler(SetLanguages.TYPE, (state, languages) => setWith(state, { languages }))
  .withHandler(SetInventory.TYPE, (state, inventory) => setWith(state, { inventory }))
  .withHandler(SetSchedules.TYPE, (state, schedules) => setWith(state, { schedules }))
  .withHandler(SetTaxRate.TYPE, (state, taxRate) => setWith(state, { taxRate }))
  .withHandler(SetThemeColor.TYPE, (state, themeColor) => setWith(state, { themeColor }))
  .withHandler(SetDonationUnits.TYPE, (state, donationUnits) => setWith(state, { donationUnits }))
  .withHandler(SetDonationPresets.TYPE, (state, donationPresets) => setWith(state, { donationPresets }))
  .withHandler(SetDefaultState.TYPE, (state, defaultState) => setWith(state, { defaultState }))
  .withHandler(SetPickupLocations.TYPE, (state, pickupLocations) => setWith(state, { pickupLocations }))
  .withHandler(SetStripePromise.TYPE, (state, keys) =>
    setWith(state, {
      stripeObjects: { main: loadStripe(keys.main), donation: loadStripe(keys.donation) },
    }),
  )
  .withDefaultHandler((state) => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  content: {},
  inventory: [],
  stripeObjects: {
    main: null,
    donation: null,
  },
  languages: ['en'],
  language: 'en',
  taxRate: 0,
  defaultState: undefined,
  donationUnits: undefined,
  pickupLocations: [],
  schedules: [],
  donationPresets: [25, 50, 100, 250],
  themeColor: 'green',
};

// selectors
export const inventorySelector = Reselect.createSelector(
  (state: IAppState) => state.cms.inventory,
  (inventory: InventoryRecord[]) => {
    return inventory;
  },
);

export const appIsReadySelector = Reselect.createSelector(
  (state: IAppState) => state.cms.content,
  inventorySelector,
  (records: Record<string, IContentRecord>, inventory: InventoryRecord[]) => {
    return Object.keys(records).length > 0 && inventory.length > 0;
  },
);

export const stripePromiseSelector = (type: 'donation' | 'main') =>
  Reselect.createSelector(
    (state: IAppState) => state.cms.stripeObjects[type],
    (stripePromise: Promise<Stripe | null> | null) => {
      return stripePromise;
    },
  );

export const pickupLocationsSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.pickupLocations,
  (state: IAppState) => state.cms.schedules,
  (pickupLocations: IPickupLocation[], schedules: ISchedule[]) => {
    return pickupLocations.map((pickupLocation) => {
      const resolvedSchedules = pickupLocation.schedules.map(
        (scheduleId: any) => schedules.find((s) => s.id === scheduleId)!,
      );
      pickupLocation.schedules = resolvedSchedules;
      return pickupLocation;
    });
  },
);

export const makeProductDetailSelector = () =>
  Reselect.createSelector(
    inventorySelector,
    (_: any, productId: string) => productId,
    (inventory: InventoryRecord[], productId: string) => {
      return inventory.find((item) => item.id === productId);
    },
  );

export const makeContentValueSelector = () =>
  Reselect.createSelector(
    (state: IAppState) => state.cms.content,
    (state: IAppState) => state.cms.language,
    (_: any, key: string) => key,
    (content: Record<string, IContentRecord>, language: string, key: string) => {
      const value: IContentRecord = content[key];

      if (Object.keys(content).length === 0) {
        return '';
      }

      if (!value) {
        console.log(`Missing ${key} value in CMS`);
        return '';
      }

      if (value.image) {
        return value.image[0]?.url;
      }

      return getRecordValueForLanguage(value, language);
    },
  );

export const makeContentImageSelector = () =>
  Reselect.createSelector(
    (state: IAppState) => state.cms.content,
    (state: IAppState) => state.cms.language,
    (_: any, key: string) => key,
    (content: Record<string, IContentRecord>, language: string, key: string) => {
      const value: IContentRecord = content[key];

      if (Object.keys(content).length === 0) {
        return { url: '', alt: '' };
      }

      if (!value) {
        console.log(`Missing ${key} value in CMS`);
        return { url: '', alt: '' };
      }

      if (value.image) {
        return {
          url: value.image[0]?.url,
          alt: getRecordValueForLanguage(value, language),
        };
      } else {
        console.log(`${key} is not an image value in CMS`);
        return { url: '', alt: '' };
      }
    },
  );

export function getRecordValueForLanguage(record: IContentRecord, language: string) {
  return record[language] as string;
}

// hooks
export function useContent(key?: string) {
  const contentValueSelector = useMemo(makeContentValueSelector, []);
  return useSelector(key ? (state: IAppState) => contentValueSelector(state, key) : () => '');
}

export function useContentImage(key?: string) {
  const contentImageValueSelector = useMemo(makeContentImageSelector, []);
  return useSelector(key ? (state: IAppState) => contentImageValueSelector(state, key) : () => ({ url: '', alt: '' }));
}
