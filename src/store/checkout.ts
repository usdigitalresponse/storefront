import * as Reselect from 'reselect';
import { IAppState } from './app';
import { IOrderDetails } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICheckoutState {
  isPaying: boolean;
  error?: string;
  orderSummary?: IOrderDetails;
}

// actions
export const SetIsPaying = TypedAction.define('APP/CHECKOUT/SET_IS_PAYING')<boolean>();
export const SetError = TypedAction.define('APP/CHECKOUT/SET_ERROR')<string | undefined>();
export const SetOrderSummary = TypedAction.define('APP/CHECKOUT/SET_ORDER_SUMMARY')<IOrderDetails>();

// reducer
export const checkoutReducer: any = TypedReducer.builder<ICheckoutState>()
  .withHandler(SetIsPaying.TYPE, (state, isPaying) => setWith(state, { isPaying }))
  .withHandler(SetError.TYPE, (state, error) => setWith(state, { error }))
  .withHandler(SetOrderSummary.TYPE, (state, orderSummary) => setWith(state, { orderSummary }))
  .withDefaultHandler(state => (state ? state : initialCheckoutState))
  .build();

// init
export const initialCheckoutState: ICheckoutState = {
  isPaying: false,
  error: undefined,
  orderSummary: undefined,
};

// selectors
export const isPayingSelector = Reselect.createSelector(
  (state: IAppState) => state.checkout.isPaying,
  (isPaying: boolean) => {
    return isPaying;
  }
);
