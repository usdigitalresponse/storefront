import { ICmsState, cmsReducer, initialCmsState } from './cms';
import { combineReducers } from 'redux';

// model
export interface IAppState {
  cms: ICmsState;
  inventory: Array<any>;
}

// reducer
export const appReducer = combineReducers<IAppState>({
  cms: cmsReducer
});

// init
export const initialAppState = {
  cms: initialCmsState,
  inventory: []
};
