import { AirtableService } from '../services/AirtableService';
import { Provider } from 'react-redux';
import { configureStore } from '../store/configureStore';
import React from 'react';

import styles from '../App.module.scss';

const store = configureStore();
AirtableService.init(store);

export default function Home () {
  return (<Provider store={store}>
    <section className="grid-container usa-section" id="share">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-8 usa-prose">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">

          </h2>
          <p>
            <section id="request_form">
              <iframe className="airtable-embed airtable-dynamic-height" src={`https://airtable.com/embed/shrW0ZzO4ugNILDcF`} frameBorder="0" style={{ width: '100%' }} height="2316" />
            </section>
          </p>
        </div>
      </div>
    </section>
  </Provider>)
}
