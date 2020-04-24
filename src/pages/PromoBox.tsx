import React from 'react';

const styles = {
  productBox: {
    display: 'inline-block',
    width: '30%',
    marginRight: '2%',
    verticalAlign: 'top',
    border: '1px solid silver',
    cursor: 'pointer'
  },
  product: {
    height: '250px',
    backgroundSize: 'cover',
    cursor: 'pointer',
    border: '2px solid transparent',
    verticalAlign: 'middle'
  },
  productDesc: {
    padding: '10px',
    fontSize: '90%'
  },
  boxName: {
    marginTop: 0,
    fontWeight: 600
  },
  linklike: {
    display: 'block',
    textDecoration: 'none',
    color: '#09f'
  },
  out_of_order: {
    color: 'red',
    fontWeight: 600
  }
}

const out_of_stock = (box: any) => box.box.out_of_stock.trim().toUpperCase() === "YES";

export default function PromoBox (box: any, index: number, key: number) {
  return <div style={styles.productBox} key={key}>
    <a href={`/box_details?id=${box.index}`}>
      <div style={{...styles.product, backgroundImage: `url(${box.box.image})`}}>
      </div>
      <div style={styles.productDesc}>
        <h4 style={styles.boxName}>{box.box.title}</h4>
        <p>
          {box.box.body_en}
          <span style={styles.linklike}>View Details</span>
        </p>
        <span style={{...styles.out_of_order, display: out_of_stock(box) ? 'block' : 'none'}}>
          Out of Stock
        </span>
      </div>
    </a>
  </div>
};
