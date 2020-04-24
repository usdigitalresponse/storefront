import { IAppState } from '../store/app';
import { SetRecords } from '../store/cms';
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
      .then(records => {
        CMSService.store.dispatch(SetRecords.create(records));
      });
  }

  private constructor(store: Store) {
    CMSService.instance = this;
    CMSService.store = store;
  }
}
