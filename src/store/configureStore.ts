import { Middleware, Reducer, Store, applyMiddleware, createStore } from 'redux';
import { loggingMiddleware, reduceCompoundActions } from 'redoodle';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import thunk from 'redux-thunk';

import { IAppState, appReducer, initialAppState } from './app';

export function configureStore(): Store<IAppState> {
  const persistConfig = {
    key: 'root',
    storage: storage,
    whitelist: ['cms', 'cart'],
  };

  const reducer = reduceCompoundActions(persistReducer(persistConfig, appReducer));
  const enhancer = applyMiddleware(
    thunk,
    loggingMiddleware({
      ignore: [],
    }) as Middleware,
  );
  const createStoreWithMiddleware = enhancer(createStore);

  const store = createStoreWithMiddleware(reducer as Reducer<IAppState>, {
    ...initialAppState,
  });

  persistStore(store);

  return store;
}
