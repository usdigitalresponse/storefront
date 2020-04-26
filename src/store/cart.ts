import * as Reselect from 'reselect';
import { IAppState } from './app';
import { ICartItem } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICartState {
  items: ICartItem[];
}

// actions
export const SetItems = TypedAction.define('APP/CART/SET_ITEMS')<ICartItem[]>();

// reducer
export const cartReducer: any = TypedReducer.builder<ICartState>()
  .withHandler(SetItems.TYPE, (state, items) => setWith(state, { items }))
  .withDefaultHandler(state => (state ? state : initialCartState))
  .build();

// init
export const initialCartState: ICartState = {
  // TODO: For illustration only, default to empty cart
  items: [{ id: '1', quantity: 2 }],
};

// selectors
export const itemsSelector = Reselect.createSelector(
  (state: IAppState) => state.cart.items,
  (items: ICartItem[]) => {
    return items;
  }
);

export const cartItemCountSelector = Reselect.createSelector(itemsSelector, (items: ICartItem[]) => {
  return items.reduce((acc: number, item: ICartItem) => acc + item.quantity, 0);
});
