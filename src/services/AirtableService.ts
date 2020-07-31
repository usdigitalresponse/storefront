import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { IDonationIntent, IOrderIntent, OrderType } from '../common/types';
import {
  SetConfig,
  SetContent,
  SetInventory,
  SetPickupLocations,
  SetQuestions,
  SetSchedules,
  SetStripePromise,
  SetValidZipcodes,
  makeContentValueSelector,
} from '../store/cms';
import { SetOrderType, SetSelectedLocation } from '../store/cart';
import { Store } from 'redux';

export class AirtableService {
  public static store: Store<IAppState>;
  public static instance: AirtableService;

  public static init(store: Store) {
    this.instance = new AirtableService(store);
    AirtableService.fetchRecords();
  }

  public static async fetchRecords() {
    return fetch('/.netlify/functions/get-cms')
      .then((res) => res.json())
      .then((records: Record<string, any>) => {
        if (!records) return;

        if (!records.config) {
          console.error('Config not defined');
          return;
        }

        const deliveryEnabled = records.config.delivery_enabled === 'false' ? false : true;

        const actions: any = [
          SetConfig.create({
            languages: records.config.languages.split(','),
            taxRate: records.config.tax_rate,
            projectName: records.config.project_name,
            defaultState: records.config.default_state,
            themeColor: records.config.theme_color,
            paymentEnabled: records.config.payment_enabled === 'false' ? false : true,
            waitlistEnabled: records.config.waitlist_enabled === 'false' ? false : true,
            donationEnabled: records.config.donation_enabled === 'false' ? false : true,
            donationUnits: records.config.donation_units,
            defaultOrderType: records.config.default_order_type || OrderType.DELIVERY,
            pickupEnabled: records.config.pickup_enabled === 'false' ? false : true,
            deliveryEnabled: deliveryEnabled,
            deliveryPreferences: records.config.delivery_preferences === 'false' ? false : true,
            deliveryOptionsOnCheckout: records.config.delivery_options_on_checkout === 'true' ? true : false,
            cartEnabled: records.config.cart_enabled === 'false' ? false : true,
            payUponPickupEnabled: records.config.pay_upon_pickup_enabled === 'false' ? false : true,
            payUponDeliveryEnabled: records.config.pay_upon_pickup_enabled === 'true' ? true : false,
            embeddedViewEnabled: records.config.driver_form === 'false' ? false : true,
            embeddedViewId: records.config.embedded_view_id,
            embeddedViewName: records.config.embedded_view_name,
            stockByLocation: records.config.stock_by_location === 'true' ? true : false,
            stripeAPIKeyMain: records.config.stripe_main_public_api_key,
            stripeAPIKeyDonation: records.config.stripe_donation_public_api_key,
          }),
          SetOrderType.create(
            deliveryEnabled ? records.config.default_order_type || OrderType.DELIVERY : OrderType.PICKUP,
          ),
          SetContent.create(records.content),
          SetInventory.create(records.inventory),
          SetSchedules.create(records.schedules),
          SetValidZipcodes.create(records.validZipcodes),
          SetQuestions.create(records.questions),
          SetPickupLocations.create(records.pickupLocations),
        ];

        if (records.pickupLocations.length === 1) {
          actions.push(SetSelectedLocation.create(records.pickupLocations[0].id));
        }

        if (typeof records.config.stripe_main_public_api_key === 'string') {
          actions.push(
            SetStripePromise.create({
              main: records.config.stripe_main_public_api_key,
            }),
          );
        }

        if (typeof records.config.stripe_donation_public_api_key === 'string') {
          actions.push(
            SetStripePromise.create({
              donation: records.config.stripe_donation_public_api_key,
            }),
          );
        }

        AirtableService.store.dispatch(CompoundAction(actions));
        document.title = makeContentValueSelector()(AirtableService.store.getState(), 'page_title');
      });
  }

  public static async fetchInventory() {
    return fetch('/.netlify/functions/get-cms')
      .then((res) => res.json())
      .then((records: Record<string, any>) => {
        if (!records) return;
        AirtableService.store.dispatch(SetInventory.create(records.inventory));
      });
  }

  public static async createOrder(order: IOrderIntent) {
    return fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then((res) => res.json());
  }

  public static async createDonation(order: IDonationIntent) {
    return fetch('/.netlify/functions/create-donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then((res) => res.json());
  }

  public static async checkDiscountCode(code: string) {
    return fetch(`/.netlify/functions/check-discount-code?discountCode=${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => (res.status === 200 ? res.json() : null));
  }

  private constructor(store: Store) {
    AirtableService.instance = this;
    AirtableService.store = store;
  }
}
