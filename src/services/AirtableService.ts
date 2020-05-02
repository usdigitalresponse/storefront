import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { IContentRecord } from '../common/types';
import { SetContent, SetInventory, SetLanguages, SetStripePromise, SetTaxRate } from '../store/cms';
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
      .then(res => res.json())

      .then((records: Record<string, IContentRecord>) => {
        if (!records) return;

        if (!records.config) {
          console.error('Config not defined');
          return;
        }

        AirtableService.store.dispatch(
          CompoundAction([
            SetContent.create(records.content),
            SetLanguages.create(records.config.languages),
            SetStripePromise.create(records.config.stripe_public_api_key),
            SetInventory.create(records.inventory),
            SetTaxRate.create(records.config.tax_rate),
          ])
        );
      });
  }

  private constructor(store: Store) {
    AirtableService.instance = this;
    AirtableService.store = store;
  }
}
