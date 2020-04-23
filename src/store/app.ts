import { INavState, initialNavState, navReducer } from './nav';
import { combineReducers } from 'redux';

// model
export interface IAppState {
  nav: INavState;
}

// reducer
export const appReducer = combineReducers<IAppState>({
  nav: navReducer,
});

// init
export const initialAppState = {
  nav: initialNavState,
};
