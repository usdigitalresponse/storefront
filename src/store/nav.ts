import * as Reselect from 'reselect';
import { IAppState } from './app';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface INavState {
  val: string;
}

// actions
export const SetVal = TypedAction.define('APP/NAV/SET_VAL')<string>();

// reducer
export const navReducer: any = TypedReducer.builder<INavState>()
  .withHandler(SetVal.TYPE, (state, val) => setWith(state, { val }))
  .withDefaultHandler(state => (state ? state : initialNavState))
  .build();

// init
export const initialNavState: INavState = {
  val: '',
};

// selectors
export const valSelector = Reselect.createSelector(
  (state: IAppState) => state.nav.val,
  (val: string) => {
    return val;
  }
);
