import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import React from 'react';

export default function CheckoutForm() {
  const elements = useElements();
  const stripe = useStripe();
  const paymentAmountCents = 100;

  const handleSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    try {
      const clientSecretResult = await fetch(
        '/.netlify/functions/stripe-payment?amountCents=' + paymentAmountCents
      ).then(res => res.json());

      if (!clientSecretResult || !clientSecretResult.client_secret) {
        throw new Error('Could not get client secret from API');
      }
      const result = await stripe.confirmCardPayment(clientSecretResult.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement) as StripeCardElement,
        },
      });

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        console.log(result.error.message);
        return;
      }

      console.log('stripe result', result);
      if (!result.paymentIntent) {
        console.log('No payment intent found in result');
        return;
      }

      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        alert('Payment succeeded');
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    } catch (error) {
      console.log('Could not process stripe paymetn', error);
    }
  };

  return (
    <section className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-8 usa-prose">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">Checkout</h2>
          <p>Paying ${(paymentAmountCents / 100).toFixed(2)}</p>
          <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
              Pay
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
