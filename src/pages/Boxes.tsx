import React from 'react';
import { IAppState } from '../store/app';
import { useSelector } from 'react-redux';
import { cmsInventory } from '../store/cms';

import PromoBox from './PromoBox';

export default function Home() {
  const boxes = useSelector<IAppState, any>(cmsInventory());

  return (
    <section className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-12 usa-prose">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">Select Your Box</h2>
          <p>
            need minimum 24 hours lead time of order, one delivery per week, how waitlist work, and where are the pickup
            locations
          </p>
          <section>
            <div className="products">
              {boxes.map((box, index) => (
                <PromoBox box={box} index={index} key={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
