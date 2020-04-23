import { IAppState } from '../store/app';
import { Store } from 'redux';

export class AirtableService {
  public static store: Store<IAppState>;
  public static instance: AirtableService;

  public static init(store: Store) {
    this.instance = new AirtableService(store);
  }

  private constructor(store: Store) {
    AirtableService.instance = this;
    AirtableService.store = store;
  }
}
