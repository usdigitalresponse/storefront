import * as Reselect from 'reselect';
import { IAppState } from './app';
import {
  IConfig,
  IContentRecord,
  IPickupLocation,
  ISchedule,
  InventoryRecord,
  OrderType,
  Question,
} from '../common/types';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// model
export interface ICmsState {
  config: IConfig;
  content: Record<string, IContentRecord>;
  inventory: InventoryRecord[];
  language: string;
  stripeObjects: {
    main: Promise<Stripe | null> | null;
    donation: Promise<Stripe | null> | null;
  };
  pickupLocations: IPickupLocation[];
  schedules: ISchedule[];
  validZipcodes: string[];
  questions: Question[];
}

// actions
export const SetConfig = TypedAction.define('APP/CMS/SET_CONFIG')<IConfig>();
export const SetContent = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetInventory = TypedAction.define('APP/CMS/SET_INVENTORY')<any>();
export const SetPickupLocations = TypedAction.define('APP/CMS/SET_PICKUP_LOCATIONS')<any>();
export const SetSchedules = TypedAction.define('APP/CMS/SET_SCHEDULES')<any>();
export const SetValidZipcodes = TypedAction.define('APP/CMS/SET_VALID_ZIPCODES')<any>();
export const SetQuestions = TypedAction.define('APP/CMS/SET_QUESTIONS')<any>();
export const SetStripePromise = TypedAction.define('APP/CMS/SET_STRIPE_PROMISE')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetConfig.TYPE, (state, config) => setWith(state, { config }))
  .withHandler(SetContent.TYPE, (state, content) => setWith(state, { content }))
  .withHandler(SetInventory.TYPE, (state, inventory) => setWith(state, { inventory }))
  .withHandler(SetSchedules.TYPE, (state, schedules) => setWith(state, { schedules }))
  .withHandler(SetValidZipcodes.TYPE, (state, validZipcodes) => setWith(state, { validZipcodes }))
  .withHandler(SetQuestions.TYPE, (state, questions) => setWith(state, { questions }))
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
  config: {
    languages: ['en'],
    taxRate: 0,
    projectName: 'USDR Food',
    defaultState: undefined,
    themeColor: 'indigo',
    paymentEnabled: true,
    donationEnabled: true,
    donationUnits: undefined,
    defaultOrderType: OrderType.DELIVERY,
    deliveryEnabled: true,
    deliveryPreferences: true,
    deliveryOptionsOnCheckout: false,
    cartEnabled: true,
    payUponPickupEnabled: true,
    driverForm: true,
    driverFormId: '',
    driverFormName: undefined,
  },
  content: {},
  inventory: [],
  stripeObjects: {
    main: null,
    donation: null,
  },
  language: 'en',
  pickupLocations: [],
  schedules: [],
  validZipcodes: [],
  questions: [],
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

export const questionsSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.questions,
  (state: IAppState) => state.checkout.isDonationRequest,
  (questions: Question[], isDonationRequest: boolean) => {
    return questions.filter((question) => isDonationRequest || (!isDonationRequest && !question.waitlistOnly));
  },
);

export const pickupLocationsSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.pickupLocations,
  (state: IAppState) => state.cms.schedules,
  (state: IAppState) => state.checkout.isDonationRequest,
  (pickupLocations: IPickupLocation[], schedules: ISchedule[], isDonationRequest: boolean) => {
    return pickupLocations
      .map((pickupLocation) => {
        const resolvedSchedules = pickupLocation.schedules
          ? pickupLocation.schedules.map((scheduleId: any) => schedules.find((s) => s.id === scheduleId)!)
          : [];
        pickupLocation.resolvedSchedules = resolvedSchedules;
        return pickupLocation;
      })
      .filter((pickupLocation) => isDonationRequest || (!isDonationRequest && !pickupLocation.waitlistOnly));
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
        // console.log(`Missing ${key} value in CMS`);
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
        // console.log(`Missing ${key} value in CMS`);
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
  const val = record[language] as string;
  return val ? val.trim() : '';
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
