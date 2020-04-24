import React from 'react';

import '../App.module.scss';

const out_of_stock = (box: any) => box.box.out_of_stock.trim().toUpperCase() === "YES";

export default function PromoBox (box: any, index: Number) {
  return <div className="product-box" key={"prod_" + index}>
    <a href={`/box_details?id=${box.index}`}>
      <div className="product" style={{backgroundImage: `url(${box.box.image})`}}>
      </div>
      <div className="product-desc">
        <h4>{box.box.title}</h4>
        <p>
          {box.box.body_en}
          <span className="linklike">View Details</span>
        </p>
        <span className="out_of_order" style={{display: out_of_stock(box) ? 'block' : 'none'}}>
          Out of Stock
        </span>
      </div>
    </a>
  </div>
};
