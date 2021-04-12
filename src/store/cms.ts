import * as Reselect from 'reselect';
import {
  CategoryRecord,
  IConfig,
  IContentRecord,
  IInventoryCategory,
  IOrderItem,
  IPickupLocation,
  ISchedule,
  IValidZipcode,
  InventoryRecord,
  OrderType,
  Question,
  ZipcodeScheduleMap,
} from '../common/types';
import { IAppState } from './app';
import { NO_CATEGORY } from '../common/constants';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { getPickupLocation, getProduct, inventoryForLanguage, questionForLanguage } from '../common/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// model
export interface ICmsState {
  categories: IInventoryCategory[];
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
  validZipcodes: IValidZipcode[];
  questions: Question[];
}

// actions
export const SetCategories = TypedAction.define('APP/CMS/SET_CATEGORIES')<any>();
export const SetConfig = TypedAction.define('APP/CMS/SET_CONFIG')<IConfig>();
export const SetContent = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetInventory = TypedAction.define('APP/CMS/SET_INVENTORY')<any>();
export const SetPickupLocations = TypedAction.define('APP/CMS/SET_PICKUP_LOCATIONS')<any>();
export const SetSchedules = TypedAction.define('APP/CMS/SET_SCHEDULES')<any>();
export const SetValidZipcodes = TypedAction.define('APP/CMS/SET_VALID_ZIPCODES')<any>();
export const SetQuestions = TypedAction.define('APP/CMS/SET_QUESTIONS')<any>();
export const SetStripePromise = TypedAction.define('APP/CMS/SET_STRIPE_PROMISE')<any>();
export const SetLanguage = TypedAction.define('APP/CMS/SET_LANGUAGE')<string>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetCategories.TYPE, (state, categories) => setWith(state, { categories }))
  .withHandler(SetConfig.TYPE, (state, config) => setWith(state, { config }))
  .withHandler(SetContent.TYPE, (state, content) => setWith(state, { content }))
  .withHandler(SetInventory.TYPE, (state, inventory) => setWith(state, { inventory }))
  .withHandler(SetSchedules.TYPE, (state, schedules) => setWith(state, { schedules }))
  .withHandler(SetValidZipcodes.TYPE, (state, validZipcodes) => setWith(state, { validZipcodes }))
  .withHandler(SetQuestions.TYPE, (state, questions) => setWith(state, { questions }))
  .withHandler(SetPickupLocations.TYPE, (state, pickupLocations) => setWith(state, { pickupLocations }))
  .withHandler(SetStripePromise.TYPE, (state, keys) =>
    setWith(state, {
      stripeObjects: {
        ...state.stripeObjects,
        ...Object.keys(keys).reduce((stripeKeys: Record<string, Promise<Stripe | null> | null>, keyType: string) => {
          stripeKeys[keyType] = loadStripe(keys[keyType]);
          return stripeKeys;
        }, {}),
      },
    }),
  )
  .withHandler(SetLanguage.TYPE, (state, language) => setWith(state, { language }))
  .withDefaultHandler((state) => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  categories: [],
  config: {
    languages: ['en'],
    taxRate: 0,
    projectName: 'USDR Food',
    defaultState: undefined,
    themeColor: 'indigo',
    paymentEnabled: true,
    waitlistEnabled: true,
    donationEnabled: true,
    donationUnits: undefined,
    ordersEnabled: true,
    defaultOrderType: OrderType.DELIVERY,
    pickupEnabled: true,
    deliveryEnabled: true,
    deliveryPreferences: true,
    deliveryOptionsOnCheckout: false,
    deliveryFee: 0,
    cartEnabled: true,
    singleCategoryCartEnabled: false,
    payUponPickupEnabled: true,
    payUponDeliveryEnabled: false,
    embeddedViewEnabled: true,
    embeddedViewId: '',
    embeddedViewName: undefined,
    stockByLocation: false,
    tippingEnabled: false,
    prescreenOrders: false,
    forceBasketItem: '',
    lotteryEnabled: false,
    defaultAllowParagraphs: false,
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
  (state: IAppState) => state.cms.language,
  (state: IAppState) => state.cms.config.languages,
  (inventory: InventoryRecord[], selectedLanguage: string, languages: string[]) => {
    return languages.length > 1 ? inventoryForLanguage(inventory, selectedLanguage) : inventory;
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
  (state: IAppState) => state.cms.language,
  (state: IAppState) => state.cms.config.languages,
  (state: IAppState) => state.checkout.isDonationRequest,
  (questions: Question[], selectedLanguage: string, languages: string[], isDonationRequest: boolean) => {
    return (languages.length > 1 ? questionForLanguage(questions, selectedLanguage) : questions).filter((question) => {
      console.log('question', question);
      return (isDonationRequest || (!isDonationRequest && !question.waitlistOnly)) && question.turnOff !== true;
    });
  },
);

export const productListSelector = Reselect.createSelector(
  inventorySelector,
  (state: IAppState) => state.cms.pickupLocations,
  (state: IAppState) => state.cms.config.stockByLocation,
  (inventory: InventoryRecord[], pickupLocations: IPickupLocation[], stockByLocation: boolean) => {
    if (stockByLocation) {
      const consolidatedInventoryObject = inventory.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = { ...item };
        }

        if (!acc[item.name].locations) {
          acc[item.name].locations = [];
        }

        if (!acc[item.name].zipcodes) {
          acc[item.name].zipcodes = [];
        }

        if (item.stockLocation && item.stockRemaining != null) {
          const location: any = getPickupLocation(item.stockLocation, pickupLocations);
          if (location) {
            location.inventoryId = item.id;
            location.stockRemaining = item.stockRemaining;
            acc[item.name].locations!.push(location);
          }
        }

        if (item.stockZipcodes && item.stockRemaining != null) {
          acc[item.name].zipcodes!.push({
            inventoryId: item.id,
            zipcodes: item.stockZipcodes,
            stockRemaining: item.stockRemaining,
          });
        }

        return acc;
      }, {} as Record<string, InventoryRecord>);

      return Object.keys(consolidatedInventoryObject).map((key) => consolidatedInventoryObject[key]);
    } else {
      return inventory;
    }
  },
);

export const productByCategorySelector = Reselect.createSelector(
  productListSelector,
  (state: IAppState) => state.cms.language,
  (state: IAppState) => state.cms.categories,
  (productList: InventoryRecord[], language: string, categories: IInventoryCategory[]) => {
    const productsById = productList.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, InventoryRecord>);
    const categoryRecords = [] as CategoryRecord[];

    // add category records with inventory from table
    categories.forEach((category) => {
      if (category.inventory != null) {
        categoryRecords.push({
          id: category.id,
          name: category.strings[language].category,
          description: category.strings[language].description,
          inventory: category.inventory
            // There seems to be cases where categories inventory contains a productId that's not in our products list,
            // resulting in productsById[productId.toString() being undefined. This filters those out
            .filter((productId) => productsById[productId.toString()])
            .map((productId) => productsById[productId.toString()]),
        });
      }
    });

    //add a category record for products that were not assigned categories
    const noCategoryProducts = productList.filter((item) => item.category === NO_CATEGORY);

    noCategoryProducts.length > 0 &&
      categoryRecords.push({
        id: NO_CATEGORY,
        name: language === 'en' ? 'Other' : 'Otros',
        description: '',
        inventory: noCategoryProducts,
      });

    return categoryRecords;
  },
);

export const pickupLocationsSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.pickupLocations,
  (state: IAppState) => state.cms.schedules,
  (state: IAppState) => state.cart.items,
  (state: IAppState) => state.checkout.isDonationRequest,
  (state: IAppState) => state.cms.config.stockByLocation,
  productListSelector,
  (
    pickupLocations: IPickupLocation[],
    schedules: ISchedule[],
    cartItems: IOrderItem[],
    isDonationRequest: boolean,
    stockByLocation: boolean,
    productList: InventoryRecord[],
  ) => {
    let resolvedPickupLocations = [];
    if (stockByLocation && cartItems.length === 1) {
      resolvedPickupLocations = getProduct(cartItems[0].id, productList)?.locations || pickupLocations;
    } else {
      resolvedPickupLocations = pickupLocations;
    }

    return resolvedPickupLocations
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

export const zipcodeListSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.validZipcodes,
  (state: IAppState) => state.cart.items,
  (state: IAppState) => state.cms.config.stockByLocation,
  productListSelector,
  (
    validZipcodes: IValidZipcode[],
    cartItems: IOrderItem[],
    stockByLocation: boolean,
    productList: InventoryRecord[],
  ) => {
    const zipcodes = validZipcodes.map((validZipcode: IValidZipcode) => validZipcode.zipcode);

    if (stockByLocation && cartItems.length === 1 && cartItems[0].quantity === 1) {
      const stockZipcodes = getProduct(cartItems[0].id, productList)?.zipcodes;
      return stockZipcodes
        ? stockZipcodes.reduce((acc, stockZipcode) => acc.concat(stockZipcode.zipcodes), [] as string[]).sort()
        : zipcodes.sort();
    } else {
      return zipcodes.sort();
    }
  },
);

export const zipcodeSchedulesSelector = Reselect.createSelector(
  (state: IAppState) => state.cms.validZipcodes,
  (state: IAppState) => state.cms.schedules,
  (validZipcodes: IValidZipcode[], schedules: ISchedule[]) => {
    return validZipcodes.reduce((zipcodeSchedules: ZipcodeScheduleMap, validZipcode: IValidZipcode) => {
      zipcodeSchedules[validZipcode.zipcode] = validZipcode.schedules
        ? validZipcode.schedules.map((scheduleId: any) => schedules.find((s) => s.id === scheduleId)!)
        : [];

      return zipcodeSchedules;
    }, {});
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
    (state: IAppState) => state.cms.config.languages,
    (_: any, key: string) => key,
    (content: Record<string, IContentRecord>, language: string, languages: string[], key: string) => {
      const value: IContentRecord = content[key];

      if (Object.keys(content).length === 0) {
        return '';
      }

      if (!value) {
        return '';
      }

      if (value.image) {
        return value.image[0]?.url;
      }

      return getRecordValueForLanguage(value, language, languages);
    },
  );

export const makeContentImageSelector = () =>
  Reselect.createSelector(
    (state: IAppState) => state.cms.content,
    (state: IAppState) => state.cms.language,
    (state: IAppState) => state.cms.config.languages,
    (_: any, key: string) => key,
    (content: Record<string, IContentRecord>, language: string, languages: string[], key: string) => {
      const value: IContentRecord = content[key];

      if (Object.keys(content).length === 0) {
        return { url: '', alt: '' };
      }

      if (!value) {
        return { url: '', alt: '' };
      }

      if (value.image) {
        return {
          url: value.image[0]?.url,
          alt: getRecordValueForLanguage(value, language, languages),
        };
      } else {
        console.log(`${key} is not an image value in CMS`);
        return { url: '', alt: '' };
      }
    },
  );

export function getRecordValueForLanguage(record: IContentRecord, language: string, languages: string[]) {
  const val = languages.length > 1 ? (record[language] as string) : (record.en as string);
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
