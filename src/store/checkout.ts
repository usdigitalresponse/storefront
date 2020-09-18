import * as Reselect from 'reselect';
import { IAppState } from './app';
import {
  IDiscountCode,
  IDonationSummary,
  IOrderSummary,
  InventoryRecord,
  OrderType,
  PayState,
  PaymentStatus,
} from '../common/types';
import { TypedAction, TypedReducer, setWith } from 'redoodle';
import { inventorySelector } from './cms';
import { totalSelector } from './cart';
import update from 'immutability-helper';

// model
export interface ICheckoutState {
  isPaying: boolean;
  error?: string;
  confirmation?: IOrderSummary | IDonationSummary;
  isDonationRequest: boolean;
  donationAmount: number;
  tipPercentage: number;
  discountCodes: IDiscountCode[];
  waitlistDialogIsOpen: boolean;
  waitlistConfirmed: boolean;
  payState: PayState;
}

// actions
export const SetIsPaying = TypedAction.define('APP/CHECKOUT/SET_IS_PAYING')<boolean>();
export const SetError = TypedAction.define('APP/CHECKOUT/SET_ERROR')<string | undefined>();
export const SetConfirmation = TypedAction.define('APP/CHECKOUT/SET_CONFIRMATION')<
  IOrderSummary | IDonationSummary | undefined
>();
export const SetDiscountCode = TypedAction.define('APP/CHECKOUT/SET_DISCOUNT_CODE')<IDiscountCode | undefined>();
export const SetDiscountCodeMultiple = TypedAction.define('APP/CHECKOUT/SET_DISCOUNT_CODES_MULTIPLE')<
  IDiscountCode | undefined
>();
export const SetIsDonationRequest = TypedAction.define('APP/CHECKOUT/SET_IS_DONATION_REQUEST')<boolean>();
export const SetDonationAmount = TypedAction.define('APP/CHECKOUT/SET_DONATION_AMOUNT')<number>();
export const SetTipPercentage = TypedAction.define('APP/CHECKOUT/SET_TIP_PERCENTAGE')<number>();
export const SetWaitlistDialogIsOpen = TypedAction.define('APP/CHECKOUT/SET_WAITLIST_DIALOG_IS_OPEN')<boolean>();
export const SetWaitlistConfirmed = TypedAction.define('APP/CHECKOUT/SET_WAITLIST_CONFIRMED')<boolean>();
export const SetPayState = TypedAction.define('APP/CHECKOUT/SET_PAY_STATE')<PayState>();

// reducer
export const checkoutReducer: any = TypedReducer.builder<ICheckoutState>()
  .withHandler(SetIsPaying.TYPE, (state, isPaying) => setWith(state, { isPaying }))
  .withHandler(SetError.TYPE, (state, error) => setWith(state, { error }))
  .withHandler(SetConfirmation.TYPE, (state, confirmation) => setWith(state, { confirmation }))
  .withHandler(SetDiscountCode.TYPE, (state, discountCode) => {
    if (discountCode) {
      // If multiple codes are not allowed, we just replace whatever is in discountCodes
      return setWith(state, { discountCodes: [discountCode] });
    }

    return setWith(state, { discountCodes: [] });
  })
  .withHandler(SetDiscountCodeMultiple.TYPE, (state, discountCode) => {
    if (discountCode) {
      return update(state, { discountCodes: { $push: [discountCode] } });
    }

    return setWith(state, { discountCodes: [] });
  })
  .withHandler(SetIsDonationRequest.TYPE, (state, isDonationRequest) => setWith(state, { isDonationRequest }))
  .withHandler(SetDonationAmount.TYPE, (state, donationAmount) => setWith(state, { donationAmount }))
  .withHandler(SetTipPercentage.TYPE, (state, tipPercentage) => setWith(state, { tipPercentage }))
  .withHandler(SetWaitlistDialogIsOpen.TYPE, (state, waitlistDialogIsOpen) => setWith(state, { waitlistDialogIsOpen }))
  .withHandler(SetWaitlistConfirmed.TYPE, (state, waitlistConfirmed) => setWith(state, { waitlistConfirmed }))
  .withHandler(SetPayState.TYPE, (state, payState) => setWith(state, { payState }))
  .withDefaultHandler((state) => (state ? state : initialCheckoutState))
  .build();

// init
export const initialCheckoutState: ICheckoutState = {
  isPaying: false,
  error: undefined,
  isDonationRequest: false,
  confirmation: undefined,
  donationAmount: 50,
  tipPercentage: 20,
  discountCodes: [],
  waitlistDialogIsOpen: false,
  waitlistConfirmed: false,
  payState: PayState.NOW,
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
    inventorySelector,
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

export const requiresPaymentSelector = Reselect.createSelector(
  totalSelector,
  (state: IAppState) => state.cart.orderType,
  (state: IAppState) => state.checkout.isDonationRequest,
  (state: IAppState) => state.cms.config.payUponPickupEnabled,
  (state: IAppState) => state.checkout.payState,
  (state: IAppState) => state.cms.config.stripeAPIKeyMain,
  (
    total: number,
    orderType: OrderType,
    isDonationRequest: boolean,
    payUponPickupEnabled: boolean,
    payState: PayState,
    stripeAPIKeyMain?: string,
  ) => {
    return (
      typeof stripeAPIKeyMain === 'string' &&
      total > 0 &&
      (orderType === OrderType.DELIVERY || !payUponPickupEnabled) &&
      !isDonationRequest &&
      payState === PayState.NOW
    );
  },
);
