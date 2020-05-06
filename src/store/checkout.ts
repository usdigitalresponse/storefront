import * as Reselect from 'reselect';
import { IAppState } from './app';
import { IOrderSummary, PaymentStatus } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICheckoutState {
  isPaying: boolean;
  error?: string;
  orderSummary?: IOrderSummary;
  donationAmount: number;
}

// actions
export const SetIsPaying = TypedAction.define('APP/CHECKOUT/SET_IS_PAYING')<boolean>();
export const SetError = TypedAction.define('APP/CHECKOUT/SET_ERROR')<string | undefined>();
export const SetOrderSummary = TypedAction.define('APP/CHECKOUT/SET_ORDER_SUMMARY')<IOrderSummary>();

// reducer
export const checkoutReducer: any = TypedReducer.builder<ICheckoutState>()
  .withHandler(SetIsPaying.TYPE, (state, isPaying) => setWith(state, { isPaying }))
  .withHandler(SetError.TYPE, (state, error) => setWith(state, { error }))
  .withHandler(SetOrderSummary.TYPE, (state, orderSummary) => setWith(state, { orderSummary }))
  .withDefaultHandler((state) => (state ? state : initialCheckoutState))
  .build();

// init
export const initialCheckoutState: ICheckoutState = {
  isPaying: false,
  error: undefined,
  orderSummary: undefined,
  donationAmount: 50,
};

// selectors
export const isPayingSelector = Reselect.createSelector(
  (state: IAppState) => state.checkout.isPaying,
  (isPaying: boolean) => {
    return isPaying;
  },
);

export const paymentStatusSelector = Reselect.createSelector(
  (state: IAppState) => state.checkout.isPaying,
  (state: IAppState) => state.checkout.orderSummary,
  (state: IAppState) => state.checkout.error,
  (isPaying: boolean, orderSummary?: IOrderSummary, error?: string) => {
    if (isPaying) return PaymentStatus.IN_PROGRESS;
    else if (orderSummary) return PaymentStatus.SUCCEEDED;
    else if (error) return PaymentStatus.FAILED;
    else return PaymentStatus.NONE;
  },
);
