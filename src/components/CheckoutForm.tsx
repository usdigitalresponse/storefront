import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React from 'react';

export default function CheckoutForm() {
  const elements = useElements();
  const stripe = useStripe();

  const mockOrderDetails = {
    email: 'jordan@fergus.com',
    deliveryAddress: '25 Test Street',
    fullName: 'John Johnsonson',
    items: [
      {
        id: 'recgndRjkR2NKpD6A',
        quantity: 1,
      },
    ],
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
