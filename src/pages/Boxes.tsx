import PromoBox from './PromoBox';
import React from 'react';

const box1 = {
    image: 'https://dl.airtable.com/.attachments/b2c55319fc646dd553b0d5c2fcdd5d1f/7b0d9f70/veggiebo.jpg',
    title: 'Veggie Box',
    body_en: 'Contains several servings of our favorite fresh vegetables',
    out_of_stock: 'NO',
  },
  box2 = {
    image: 'https://dl.airtable.com/.attachments/17c66b344654e82b38bc7ed3246561cd/6b0844cd/minibox.jpg',
    title: 'Mini Box',
    body_en: 'A smaller serving for people looking for fresh local vegetables',
    out_of_stock: 'NO',
  },
  box3 = {
    image: 'https://dl.airtable.com/.attachments/bcedcfcfb314454076db520cd9d9d7b3/a4a4034f/fruits.jpg',
    title: 'Fruit Box',
    body_en: 'Fruits are available from local wholesalers',
    out_of_stock: 'YES',
  };

export default function Home() {
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
              {[box1, box2, box3].map((box, index) => (
                <PromoBox box={box} index={index} key={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
