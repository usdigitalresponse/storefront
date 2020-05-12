import * as Reselect from 'reselect';
import { IAppState } from './app';
import { IDiscountCode, IDonationSummary, IOrderSummary, InventoryRecord, PaymentStatus } from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICheckoutState {
  isPaying: boolean;
  error?: string;
  confirmation?: IOrderSummary | IDonationSummary;
  isDonationRequest: boolean;
  donationAmount: number;
  discountCode?: IDiscountCode;
}

// actions
export const SetIsPaying = TypedAction.define('APP/CHECKOUT/SET_IS_PAYING')<boolean>();
export const SetError = TypedAction.define('APP/CHECKOUT/SET_ERROR')<string | undefined>();
export const SetConfirmation = TypedAction.define('APP/CHECKOUT/SET_CONFIRMATION')<
  IOrderSummary | IDonationSummary | undefined
>();
export const SetDiscountCode = TypedAction.define('APP/CHECKOUT/SET_DISCOUNT_CODE')<IDiscountCode | undefined>();
export const SetIsDonationRequest = TypedAction.define('APP/CHECKOUT/SET_IS_DONATION_REQUEST')<boolean>();
export const SetDonationAmount = TypedAction.define('APP/CHECKOUT/SET_DONATION_AMOUNT')<number>();

// reducer
export const checkoutReducer: any = TypedReducer.builder<ICheckoutState>()
  .withHandler(SetIsPaying.TYPE, (state, isPaying) => setWith(state, { isPaying }))
  .withHandler(SetError.TYPE, (state, error) => setWith(state, { error }))
  .withHandler(SetConfirmation.TYPE, (state, confirmation) => setWith(state, { confirmation }))
  .withHandler(SetDiscountCode.TYPE, (state, discountCode) => setWith(state, { discountCode }))
  .withHandler(SetIsDonationRequest.TYPE, (state, isDonationRequest) => setWith(state, { isDonationRequest }))
  .withHandler(SetDonationAmount.TYPE, (state, donationAmount) => setWith(state, { donationAmount }))
  .withDefaultHandler((state) => (state ? state : initialCheckoutState))
  .build();

// init
export const initialCheckoutState: ICheckoutState = {
  isPaying: false,
  error: undefined,
  isDonationRequest: false,
  confirmation: undefined,
  donationAmount: 50,
  discountCode: undefined,
};

// selectors
export const isPayingSelector = Reselect.createSelector(
  (state: IAppState) => state.checkout.isPaying,
  (isPaying: boolean) => {
    return isPaying;
  },
);

export const makeDonationUnitCountSelector = () =>
  Reselect.createSelector(
    (state: IAppState) => state.cms.inventory,
    (state: IAppState) => state.checkout.donationAmount,
    (_: any, otherAmount: string) => otherAmount,
    (inventory: InventoryRecord[], donationAmount: number, otherAmount: string) => {
      const avgPrice =
        inventory.reduce((acc, item) => {
          return acc + item.price;
        }, 0) / inventory.length;

      return Math.round((otherAmount ? parseInt(otherAmount) : donationAmount) / avgPrice);
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
