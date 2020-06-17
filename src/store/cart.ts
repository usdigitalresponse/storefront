import * as Reselect from 'reselect';
import {
  DiscountCodeType,
  IDiscountCode,
  IOrderItem,
  IPickupLocation,
  InventoryRecord,
  OrderType,
} from '../common/types';
import { IAppState } from './app';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { pickupLocationsSelector } from './cms';
import update from 'immutability-helper';

// model
export interface ICartState {
  items: IOrderItem[];
  dialogIsOpen: boolean;
  locationsDialogIsOpen: boolean;
  selectedLocation?: string;
  orderType: OrderType;
  lastAdded?: IOrderItem;
  taxRate: number;
}

// actions
export const SetItems = TypedAction.define('APP/CART/SET_ITEMS')<IOrderItem[]>();
export const AddItem = TypedAction.define('APP/CART/ADD_ITEM')<IOrderItem>();
export const RemoveItem = TypedAction.define('APP/CART/REMOVE_ITEM')<number>();
export const UpdateItem = TypedAction.define('APP/CART/UPDATE_ITEM')<IOrderItem>();
export const SetDialogIsOpen = TypedAction.define('APP/CART/SET_DIALOG_IS_OPEN')<boolean>();
export const SetSelectedLocation = TypedAction.define('APP/CART/SET_SELECTED_LOCATION')<string>();
export const SetLocationsDialogIsOpen = TypedAction.define('APP/CART/SET_LOCATIONS_DIALOG_IS_OPEN')<boolean>();
export const SetOrderType = TypedAction.define('APP/CART/SET_ORDER_TYPE')<OrderType>();

// reducer
export const cartReducer: any = TypedReducer.builder<ICartState>()
  .withHandler(SetItems.TYPE, (state, items) => setWith(state, { items }))
  .withHandler(SetSelectedLocation.TYPE, (state, selectedLocation) => setWith(state, { selectedLocation }))
  .withHandler(AddItem.TYPE, (state, item) => {
    const existingItemIndex = state.items.findIndex((i) => item.id === i.id);
    if (existingItemIndex !== -1) {
      return update(state, {
        items: { [existingItemIndex]: { quantity: { $set: state.items[existingItemIndex].quantity + item.quantity } } },
        lastAdded: { $set: item },
      });
    } else {
      return update(state, { items: { $push: [item] }, lastAdded: { $set: item } });
    }
  })
  .withHandler(UpdateItem.TYPE, (state, item) => {
    const index = state.items.findIndex((cartItem) => cartItem.id === item.id);
    return update(state, { items: { $splice: [[index, 1, item]] } });
  })
  .withHandler(RemoveItem.TYPE, (state, index) => update(state, { items: { $splice: [[index, 1]] } }))
  .withHandler(SetDialogIsOpen.TYPE, (state, dialogIsOpen) => {
    return setWith(state, { dialogIsOpen, lastAdded: dialogIsOpen ? state.lastAdded : undefined });
  })
  .withHandler(SetLocationsDialogIsOpen.TYPE, (state, locationsDialogIsOpen) =>
    setWith(state, { locationsDialogIsOpen }),
  )
  .withHandler(SetOrderType.TYPE, (state, orderType) => setWith(state, { orderType }))
  .withDefaultHandler((state) => (state ? state : initialCartState))
  .build();

// init
export const initialCartState: ICartState = {
  items: [],
  selectedLocation: undefined,
  dialogIsOpen: false,
  locationsDialogIsOpen: false,
  orderType: OrderType.DELIVERY,
  taxRate: 0.085,
};

// selectors
export const itemsSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (items: IOrderItem[]) => {
    return items;
  },
);

export const IOrderItemCountSelector = Reselect.createSelector(itemsSelector, (items: IOrderItem[]) => {
  return items.reduce((acc: number, item: IOrderItem) => acc + item.quantity, 0);
});

export const subtotalSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (state: IAppState) => state.cms.inventory,
  (cartItems: IOrderItem[], inventory: InventoryRecord[]) => {
    return cartItems.reduce((acc: number, cartItem: IOrderItem) => {
      return acc + cartItem.quantity * (inventory.find((product) => product.id === cartItem.id)?.price || 0);
    }, 0);
  },
);

export const discountSelector = Reselect.createSelector(
  subtotalSelector,
  (state: IAppState) => state.checkout.discountCode,
  (subtotal: number, discountCode?: IDiscountCode) => {
    return !discountCode
      ? 0
      : discountCode.type === DiscountCodeType.DOLLARS
      ? discountCode.amount
      : subtotal * (discountCode.amount / 100);
  },
);

export const taxSelector = Reselect.createSelector(
  subtotalSelector,
  discountSelector,
  (state: IAppState) => state.cms.config.taxRate,
  (state: IAppState) => state.checkout.isDonationRequest,
  (subtotal: number, discount: number, taxRate: number, isDonationRequest: boolean) => {
    return isDonationRequest ? 0 : Math.max(subtotal - discount, 0) * taxRate;
  },
);

export const totalSelector = Reselect.createSelector(
  subtotalSelector,
  discountSelector,
  taxSelector,
  (subtotal: number, discount: number, tax: number) => {
    return Math.max(subtotal - discount, 0) + tax;
  },
);

export const requiresPaymentSelector = Reselect.createSelector(
  totalSelector,
  (state: IAppState) => state.cart.orderType,
  (state: IAppState) => state.checkout.isDonationRequest,
  (total: number, orderType: OrderType, isDonationRequest: boolean) => {
    return total > 0 && orderType === OrderType.DELIVERY && !isDonationRequest;
  },
);

export const selectedLocationSelector = Reselect.createSelector(
  pickupLocationsSelector,
  (state: IAppState) => state.cart.selectedLocation,
  (pickupLocations: IPickupLocation[], selectedLocation?: string) => {
    return pickupLocations.find((location) => selectedLocation === location.id);
  },
);
