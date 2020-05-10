import { ICartState, cartReducer, initialCartState } from './cart';
import { ICheckoutState, checkoutReducer, initialCheckoutState } from './checkout';
import { ICmsState, cmsReducer, initialCmsState } from './cms';
import { combineReducers } from 'redux';

// model
export interface IAppState {
  cms: ICmsState;
  cart: ICartState;
  checkout: ICheckoutState;
  _persist?: any;
}

// reducer
export const appReducer = combineReducers<IAppState>({
  cms: cmsReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
});

// init
export const initialAppState = {
  cms: initialCmsState,
  cart: initialCartState,
  checkout: initialCheckoutState,
};
