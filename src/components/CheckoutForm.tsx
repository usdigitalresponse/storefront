import { AirtableService } from '../services/AirtableService';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import React, { useState } from 'react';

export default function CheckoutForm() {
  const mockOrderDetails = {
    deliveryAddress: '25 Test Street',
    fullName: 'John Johnsonson',
    items: [
      {
        id: 'recgndRjkR2NKpD6A',
        quantity: 1,
      },
    ],
  };

  const elements = useElements();
  const stripe = useStripe();
  const paymentAmountCents = 100;

  const [errorMessage, setErrorMessage] = useState<string | null | undefined>();
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handleSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    setIsPaying(true);

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
        setErrorMessage(result.error.message);
        setIsPaying(false);
        return;
      }

      console.log('stripe result', result);
      if (!result.paymentIntent) {
        console.log('No payment intent found in result');
        setErrorMessage('Error processing Stripe Payment');
        setIsPaying(false);
        return;
      }

      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        setErrorMessage(null);

        const createdOrder = await AirtableService.createOrder({
          stripePaymentId: result.paymentIntent.id,
          amount: paymentAmountCents / 100,
          deliveryAddress: mockOrderDetails.deliveryAddress,
          fullName: mockOrderDetails.fullName,
          items: mockOrderDetails.items,
        });
        console.log('createdOrder', createdOrder);
        setpaidOrder(createdOrder);
        setPaymentSuccess(true);
        setIsPaying(false);
      }
    } catch (error) {
      console.log('Could not process stripe paymetn', error);
      setErrorMessage(error);
      setIsPaying(false);
    }
  };

  return (
    <section className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-8 usa-prose">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">Checkout</h2>
          <p>Paying ${(paymentAmountCents / 100).toFixed(2)}</p>
          <table>
            <tbody>
              <tr>
                <th>Name:</th>
                <td>
                  <input type="text" disabled value={mockOrderDetails.fullName} />
                </td>
              </tr>
              <tr>
                <th>Delivery Address:</th>
                <td>
                  <input type="text" disabled value={mockOrderDetails.deliveryAddress} />
                </td>
              </tr>
            </tbody>
          </table>
          {!paymentSuccess && (
            <form onSubmit={handleSubmit}>
              <CardElement />
              <button type="submit" disabled={!stripe || isPaying}>
                {isPaying ? 'Paying...' : 'Pay'}
              </button>
              {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
            </form>
          )}

          {paymentSuccess && <span style={{ color: 'green' }}>Order placed successfully</span>}
          {paidOrder && (
            <pre style={{ width: 800, height: 200, backgroundColor: '#eee', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(paidOrder)}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
