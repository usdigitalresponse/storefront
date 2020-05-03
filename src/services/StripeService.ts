import { AirtableService } from './AirtableService';
import { CardElement } from '@stripe/react-stripe-js';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { ICheckoutFormData } from '../common/types';
import { SetError, SetIsPaying, SetOrderSummary } from '../store/checkout';
import { Store } from 'redux';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { totalSelector } from '../store/cart';

export class StripeService {
  public static store: Store<IAppState>;
  public static instance: StripeService;

  public static init(store: Store) {
    this.instance = new StripeService(store);
  }

  public static async pay(formData: ICheckoutFormData, stripe: Stripe | null, elements: StripeElements | null) {
    if (!stripe || !elements) return;

    const amount = totalSelector(StripeService.store.getState());
    const items = StripeService.store.getState().cart.items;

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

      if (result.error || !result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
        CompoundAction([
          SetError.create(result.error?.message || 'We were unable to process your payment at this time'),
          SetIsPaying.create(false),
        ]);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        const stripePaymentId = result.paymentIntent.id;
        const orderSummary = await AirtableService.createOrder({
          ...formData,
          amount,
          items,
          stripePaymentId,
        });

        StripeService.store.dispatch(CompoundAction([SetIsPaying.create(false), SetOrderSummary.create(orderSummary)]));
      }
    } catch (error) {
      console.log('Stripe payment error', error);
      StripeService.store.dispatch(
        CompoundAction([
          SetError.create(error || 'We were unable to process your payment at this time'),
          SetIsPaying.create(false),
        ])
      );
    }
  }

  private constructor(store: Store) {
    StripeService.instance = this;
    StripeService.store = store;
  }
}
