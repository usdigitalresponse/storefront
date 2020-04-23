import { AirtableService } from './services/AirtableService';
import { Provider } from 'react-redux';
import { configureStore } from './store/configureStore';
import React from 'react';
import styles from './App.module.scss';

const store = configureStore();
AirtableService.init(store);

function App() {
  return (
    <Provider store={store}>
      <div className={styles.app}>USDR Food</div>
    </Provider>
  );
}

export default App;
