import { CMSRecord } from '../common/types';
import { CompoundAction } from 'redoodle';
import { IAppState } from '../store/app';
import { SetLanguages, SetRecords } from '../store/cms';
import { Store } from 'redux';

export class CMSService {
  public static store: Store<IAppState>;
  public static instance: CMSService;

  public static init(store: Store) {
    this.instance = new CMSService(store);
    CMSService.fetchRecords();
  }

  private static fetchRecords() {
    fetch('/api/get-cms')
      .then(res => res.json())
      .then(json => json.records)
      .then((records: CMSRecord[]) => {
        if (!records.length) return;
        const languages = records[0].en.split(',');
        CMSService.store.dispatch(
          CompoundAction([SetRecords.create(records.slice(1)), SetLanguages.create(languages)])
        );
      });
  }

  private constructor(store: Store) {
    CMSService.instance = this;
    CMSService.store = store;
  }
}
