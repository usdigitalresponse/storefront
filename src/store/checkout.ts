import * as Reselect from 'reselect';
import { IAppState } from './app';
import { IDonationSummary, IOrderSummary, PaymentStatus } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICheckoutState {
  isPaying: boolean;
  error?: string;
  confirmation?: IOrderSummary | IDonationSummary;
  donationAmount: number;
}

// actions
export const SetIsPaying = TypedAction.define('APP/CHECKOUT/SET_IS_PAYING')<boolean>();
export const SetError = TypedAction.define('APP/CHECKOUT/SET_ERROR')<string | undefined>();
export const SetConfirmation = TypedAction.define('APP/CHECKOUT/SET_ORDER_SUMMARY')<IOrderSummary | IDonationSummary>();
export const SetDonationAmount = TypedAction.define('APP/CHECKOUT/SET_DONATION_AMOUNT')<number>();

// reducer
export const checkoutReducer: any = TypedReducer.builder<ICheckoutState>()
  .withHandler(SetIsPaying.TYPE, (state, isPaying) => setWith(state, { isPaying }))
  .withHandler(SetError.TYPE, (state, error) => setWith(state, { error }))
  .withHandler(SetConfirmation.TYPE, (state, confirmation) => setWith(state, { confirmation }))
  .withHandler(SetDonationAmount.TYPE, (state, donationAmount) => setWith(state, { donationAmount }))
  .withDefaultHandler((state) => (state ? state : initialCheckoutState))
  .build();

// init
export const initialCheckoutState: ICheckoutState = {
  isPaying: false,
  error: undefined,
  confirmation: undefined,
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
  (state: IAppState) => state.checkout.confirmation,
  (state: IAppState) => state.checkout.error,
  (isPaying: boolean, confirmation?: IOrderSummary | IDonationSummary, error?: string) => {
    if (isPaying) return PaymentStatus.IN_PROGRESS;
    else if (confirmation) return PaymentStatus.SUCCEEDED;
    else if (error) return PaymentStatus.FAILED;
    else return PaymentStatus.NONE;
  },
);
