import React from 'react';

export default function Home() {
  return (
    <section className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-8 usa-prose">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">Header</h2>
          <p>
            <section id="request_form">
              <iframe
                title="driverForm"
                className="airtable-embed airtable-dynamic-height"
                src={`https://airtable.com/embed/shrW0ZzO4ugNILDcF`}
                frameBorder="0"
                style={{ width: '100%' }}
                height="2316"
              />
            </section>
          </p>
        </div>
      </div>
    </section>
  );
}
