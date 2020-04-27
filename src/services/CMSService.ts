import { CMSRecord } from '../common/types';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { SetInventory, SetLanguages, SetRecords, SetStripePromise } from '../store/cms';
import { Store } from 'redux';

export class CMSService {
  public static store: Store<IAppState>;
  public static instance: CMSService;

  public static init(store: Store) {
    this.instance = new CMSService(store);
    CMSService.fetchRecords();
  }

  private static fetchRecords() {
    fetch('/.netlify/functions/get-cms')
      .then(res => res.json())

      .then((records: Record<string, CMSRecord>) => {
        if (!records) return;

        if (!records.config) {
          console.error('Config not defined');
          return;
        }
        CMSService.store.dispatch(
          CompoundAction([
            SetRecords.create(records.cms),
            SetLanguages.create(records.config.languages),
            SetStripePromise.create(records.config.stripe_public_api_key),
            SetInventory.create(records.inventory),
          ])
        );
      });
  }

  private constructor(store: Store) {
    CMSService.instance = this;
    CMSService.store = store;
  }
}
