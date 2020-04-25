import { IAppState } from '../store/app';
import { cmsValueForKeySelector } from '../store/cms';
import { useSelector } from 'react-redux';
import Interweave from 'interweave';
import React from 'react';

export default function Home() {
  const heroTitle = useSelector<IAppState, string>(cmsValueForKeySelector('hero_title')),
        heroImageUrl = useSelector<IAppState, string>(cmsValueForKeySelector('hero_image')),
        locationImageUrl = useSelector<IAppState, string>(cmsValueForKeySelector('location_image'))
        ;

  return (
    <div>
      <section aria-label="Introduction" id="hero">
        <div
          className="usa-hero"
          style={{
            backgroundImage: `url(${heroImageUrl})`,
          }}
        >
          <div className="grid-container">
            <div className="usa-hero__callout">
              <h1 className="usa-hero__heading">
                <span className="usa-hero__heading--alt">{heroTitle}</span>
              </h1>
              <p>Supporting our community</p>
              <p>
                <a className="usa-button" href="/boxes">
                  Order a Box
                </a>
              </p>
              <p>
                <a className="usa-button" href="/drive">
                  Drive or Distribute
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid-container usa-section">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col-4">
            <h2 className="font-heading-xl margin-bottom-2 tablet:margin-bottom-2">How does this work?</h2>
          </div>
          <div className="tablet:grid-col-8 usa-prose">
            <div>
              <Interweave
                content={`
            - Enter your name, address, and information.
            - Request 1-3 boxes of fruits and vegetables.
            - Boxes are delivered or distributed at stores (stores accept EBT & Cash)
            `}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="usa-section usa-section--dark">
        <div className="grid-container">
          <h2 className="font-heading-xl margin-y-0">Keeping families healthy</h2>
          <p>
            <a className="usa-button usa-button--big" href="/request">
              Request a delivery
            </a>
          </p>
        </div>
      </section>
      <section className="grid-container usa-section" id="currently_serving">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col-4">
            <img
              src={locationImageUrl}
              alt="vegetables"
            />
          </div>
          <div className="tablet:grid-col-8 usa-prose">
            <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">Launching local</h2>
            <div>
              <Interweave
                content={'We are working with wholesalers and volunteers in Bexar County / San Antonio, Texas'}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
