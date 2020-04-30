import * as Reselect from 'reselect';
import { IAppState } from './app';
import { ICartItem } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import update from 'immutability-helper';

// model
export interface ICartState {
  items: ICartItem[];
  dialogIsOpen: boolean;
}

// actions
export const SetItems = TypedAction.define('APP/CART/SET_ITEMS')<ICartItem[]>();
export const AddItem = TypedAction.define('APP/CART/ADD_ITEM')<ICartItem>();
export const SetDialogIsOpen = TypedAction.define('APP/CART/SET_DIALOG_IS_OPEN')<boolean>();

// reducer
export const cartReducer: any = TypedReducer.builder<ICartState>()
  .withHandler(SetItems.TYPE, (state, items) => setWith(state, { items }))
  .withHandler(AddItem.TYPE, (state, item) => update(state, { items: { $push: [item] }, dialogIsOpen: { $set: true } }))
  .withHandler(SetDialogIsOpen.TYPE, (state, dialogIsOpen) => setWith(state, { dialogIsOpen }))
  .withDefaultHandler(state => (state ? state : initialCartState))
  .build();

// init
export const initialCartState: ICartState = {
  // TODO: For illustration only, default to empty cart
  items: [],
  dialogIsOpen: false,
};

// selectors
export const itemsSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (items: ICartItem[]) => {
    return items;
  }
);

export const ICartItemCountSelector = Reselect.createSelector(itemsSelector, (items: ICartItem[]) => {
  return items.reduce((acc: number, item: ICartItem) => acc + item.quantity, 0);
});
