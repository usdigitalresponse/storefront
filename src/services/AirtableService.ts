import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { IDonationIntent, IOrderIntent } from '../common/types';
import {
  SetConfig,
  SetContent,
  SetInventory,
  SetPickupLocations,
  SetSchedules,
  SetStripePromise,
  SetValidZipcodes,
  makeContentValueSelector,
} from '../store/cms';
import { SetSelectedLocation } from '../store/cart';
import { Store } from 'redux';

export class AirtableService {
  public static store: Store<IAppState>;
  public static instance: AirtableService;

  public static init(store: Store) {
    this.instance = new AirtableService(store);
    AirtableService.fetchRecords();
  }

  private static fetchRecords() {
    fetch('/.netlify/functions/get-cms')
      .then((res) => res.json())
      .then((records: Record<string, any>) => {
        if (!records) return;

        if (!records.config) {
          console.error('Config not defined');
          return;
        }

        const actions: any = [
          SetConfig.create({
            languages: records.config.languages,
            taxRate: records.config.tax_rate,
            projectName: records.config.project_name,
            defaultState: records.config.default_state,
            themeColor: records.config.theme_color,
            donationUnits: records.config.donation_units,
            deliveryPreferences: records.config.delivery_preferences === 'false' ? false : true,
            driverForm: records.config.driver_form === 'false' ? false : true,
            driverFormId: records.config.driver_form_id,
            driverFormName: records.config.driver_form_name,
          }),
          SetContent.create(records.content),
          SetInventory.create(records.inventory),
          SetSchedules.create(records.schedules),
          SetValidZipcodes.create(records.validZipcodes),
          SetPickupLocations.create(records.pickupLocations),
          SetStripePromise.create({
            main: records.config.stripe_main_public_api_key,
            donation: records.config.stripe_donation_public_api_key,
          }),
        ];

        if (records.pickupLocations.length === 1) {
          actions.push(SetSelectedLocation.create(records.pickupLocations[0].id));
        }

        AirtableService.store.dispatch(CompoundAction(actions));
        document.title = makeContentValueSelector()(AirtableService.store.getState(), 'page_title');
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
