import * as Reselect from 'reselect';
import { IAppState } from './app';
import { ICartItem, IPickupLocation, InventoryRecord, OrderType } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { pickupLocationsSelector } from './cms';
import update from 'immutability-helper';

// model
export interface ICartState {
  items: ICartItem[];
  dialogIsOpen: boolean;
  locationsDialogIsOpen: boolean;
  selectedLocation?: string;
  orderType: OrderType;
  taxRate: number;
}

// actions
export const SetItems = TypedAction.define('APP/CART/SET_ITEMS')<ICartItem[]>();
export const AddItem = TypedAction.define('APP/CART/ADD_ITEM')<ICartItem>();
export const RemoveItem = TypedAction.define('APP/CART/REMOVE_ITEM')<number>();
export const UpdateItem = TypedAction.define('APP/CART/UPDATE_ITEM')<ICartItem>();
export const SetDialogIsOpen = TypedAction.define('APP/CART/SET_DIALOG_IS_OPEN')<boolean>();
export const SetSelectedLocation = TypedAction.define('APP/CART/SET_SELECTED_LOCATION')<string>();
export const SetLocationsDialogIsOpen = TypedAction.define('APP/CART/SET_LOCATIONS_DIALOG_IS_OPEN')<boolean>();
export const SetOrderType = TypedAction.define('APP/CART/SET_ORDER_TYPE')<OrderType>();

// reducer
export const cartReducer: any = TypedReducer.builder<ICartState>()
  .withHandler(SetItems.TYPE, (state, items) => setWith(state, { items }))
  .withHandler(SetSelectedLocation.TYPE, (state, selectedLocation) => setWith(state, { selectedLocation }))
  .withHandler(AddItem.TYPE, (state, item) => update(state, { items: { $push: [item] }, dialogIsOpen: { $set: true } }))
  .withHandler(UpdateItem.TYPE, (state, item) => {
    const index = state.items.findIndex((cartItem) => cartItem.id === item.id);
    return update(state, { items: { $splice: [[index, 1, item]] } });
  })
  .withHandler(RemoveItem.TYPE, (state, index) => update(state, { items: { $splice: [[index, 1]] } }))
  .withHandler(SetDialogIsOpen.TYPE, (state, dialogIsOpen) => setWith(state, { dialogIsOpen }))
  .withHandler(SetLocationsDialogIsOpen.TYPE, (state, locationsDialogIsOpen) =>
    setWith(state, { locationsDialogIsOpen }),
  )
  .withHandler(SetOrderType.TYPE, (state, orderType) => setWith(state, { orderType }))
  .withDefaultHandler((state) => (state ? state : initialCartState))
  .build();

// init
export const initialCartState: ICartState = {
  // TODO: For illustration only, default to empty cart
  items: [
    { id: 'recwKKxpcBBFteKdG', quantity: 1 },
    { id: 'recSmc0lCgRXWKe3J', quantity: 2 },
  ],
  selectedLocation: undefined,
  dialogIsOpen: false,
  locationsDialogIsOpen: false,
  orderType: OrderType.DELIVERY,
  taxRate: 0.085,
};

// selectors
export const itemsSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (items: ICartItem[]) => {
    return items;
  },
);

export const ICartItemCountSelector = Reselect.createSelector(itemsSelector, (items: ICartItem[]) => {
  return items.reduce((acc: number, item: ICartItem) => acc + item.quantity, 0);
});

export const subtotalSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (state: IAppState) => state.cms.inventory,
  (cartItems: ICartItem[], inventory: InventoryRecord[]) => {
    return cartItems.reduce((acc: number, cartItem: ICartItem) => {
      return acc + cartItem.quantity * (inventory.find((product) => product.id === cartItem.id)?.price || 0);
    }, 0);
  },
);

export const totalSelector = Reselect.createSelector(
  subtotalSelector,
  (state: IAppState) => state.cart.taxRate,
  (subtotal: number, taxRate: number) => {
    return subtotal + subtotal * taxRate;
  },
);

export const selectedLocationSelector = Reselect.createSelector(
  pickupLocationsSelector,
  (state: IAppState) => state.cart.selectedLocation,
  (pickupLocations: IPickupLocation[], selectedLocation?: string) => {
    return pickupLocations.find((location) => selectedLocation === location.id);
  },
);
