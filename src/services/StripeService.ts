import { AirtableService } from './AirtableService';
import { CardElement } from '@stripe/react-stripe-js';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { ICheckoutFormData } from '../common/types';
import { SetError, SetIsPaying, SetOrderSummary } from '../store/checkout';
import { Store } from 'redux';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { makeContentValueSelector } from '../store/cms';
import { totalSelector } from '../store/cart';

export class StripeService {
  public static store: Store<IAppState>;
  public static instance: StripeService;

  public static init(store: Store) {
    this.instance = new StripeService(store);
  }

  public static async pay(formData: ICheckoutFormData, stripe: Stripe | null, elements: StripeElements | null) {
    if (!stripe || !elements) return;

    const state = StripeService.store.getState();
    const errorMessage = makeContentValueSelector()(state, 'error_payment');
    const amount = totalSelector(state);
    const type = state.cart.orderType;
    const items = state.cart.items;

    StripeService.store.dispatch(CompoundAction([SetIsPaying.create(true), SetError.create(undefined)]));

    try {
      const clientSecretResult = await fetch(
        `/.netlify/functions/stripe-payment?amountCents=${amount * 100}`
      ).then(res => res.json());

      if (!clientSecretResult || !clientSecretResult.client_secret) {
        throw new Error('Could not get client secret. Stripe public key must be added to config table in Airtable');
      }

      const result = await stripe.confirmCardPayment(clientSecretResult.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement) as StripeCardElement,
        },
      });

      console.log('result error!', result.error?.message);

      if (result.error || !result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
        StripeService.store.dispatch(
          CompoundAction([SetError.create(result.error?.message || errorMessage), SetIsPaying.create(false)])
        );
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        const stripePaymentId = result.paymentIntent.id;
        const orderSummary = await AirtableService.createOrder({
          ...formData,
          type,
          amount,
          items,
          stripePaymentId,
        });

        StripeService.store.dispatch(CompoundAction([SetIsPaying.create(false), SetOrderSummary.create(orderSummary)]));
      }
    } catch (error) {
      console.log('Stripe payment error', error);

      StripeService.store.dispatch(CompoundAction([SetError.create(errorMessage), SetIsPaying.create(false)]));
    }
  }

  private constructor(store: Store) {
    StripeService.instance = this;
    StripeService.store = store;
  }
}
