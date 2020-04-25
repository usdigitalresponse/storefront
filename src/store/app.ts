import { ICartState, cartReducer, initialCartState } from './cart';
import { ICmsState, cmsReducer, initialCmsState } from './cms';
import { combineReducers } from 'redux';

// model
export interface IAppState {
  cms: ICmsState;
  cart: ICartState;
}

// reducer
export const appReducer = combineReducers<IAppState>({
  cms: cmsReducer,
  cart: cartReducer,
});

// init
export const initialAppState = {
  cms: initialCmsState,
  cart: initialCartState,
};
