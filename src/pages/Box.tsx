import PromoBox from './PromoBox';
import React from 'react';

const styles = {
  col: {
    display: 'inline-block',
    width: '45%',
    marginRight: '3%',
    verticalAlign: 'top',
  },
  box_preview: {
    maxWidth: '100%',
  },
  formBox: {
    width: '100%',
    background: '#eee',
    padding: '10px',
    fontSize: '85%',
    marginBottom: '15px',
  },
  splitter: {
    width: '48%',
    marginRight: '1%',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  floater: {
    width: '48%',
    display: 'inline-block',
    verticalAlign: 'middle',
    // textAlign: 'right',
    marginRight: 0,
  },
};

export default function Box() {
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
  let boxid = Number((window.location.search.split('id=')[1] || '0').split('&')[0]);
  let box: { image: string; title: string; body_en: string; out_of_stock: string } = [box1, box2, box3][boxid];
  let otherBoxes: Array<any> = [box1, box2, box3];
  otherBoxes.splice(boxid, 1);
  // otherBoxes = otherBoxes.map(box => getCmsRecordFromKey(box, cms));

  return (
    <section id="product_form">
      <div style={styles.col}>
        <img style={styles.box_preview} src={box.image} />
      </div>
      <div style={styles.col}>
        <h3>{box.title}</h3>
        <p>{box.body_en}</p>
        <ul>
          <li>Food A (1)</li>
          <li>Food B (1)</li>
          <li>&lt;3 (1)</li>
        </ul>

        <div style={styles.formBox}>
          <div style={styles.splitter}>
            Request for a Donated Box
            <br />
            <small>
              how this works
              <br />
            </small>
          </div>
          <div style={styles.floater}>
            <input type="number" value="1" />
            <a href="/checkout">
              <button>Request</button>
            </a>
          </div>
        </div>

        <div style={styles.formBox}>
          <div style={styles.splitter}>
            For Delivery of Pickup
            <br />
            <input type="number" value="1" />
            <span className="price">$XX.XX</span>
          </div>
          <div style={styles.splitter}></div>

          <hr />

          <div style={styles.splitter}>
            Deliver To Me
            <br />
            Pay with <strong>Debit</strong> or <strong>Credit Card</strong>
          </div>
          <div style={styles.splitter}>
            <a href="/checkout">
              <button className="floater">Ship It</button>
            </a>
          </div>

          <hr />

          <div style={styles.splitter}>
            Pickup
            <br />
            Pay with <strong>Cash</strong> or <strong>EBT Card</strong>
            <br />
            <br />
            Dollar General
          </div>
          <div style={styles.splitter}>
            <a href="/checkout">
              <button className="floater">Pick It Up</button>
            </a>
          </div>
        </div>
      </div>

      <hr />

      <h4>Other Options</h4>
      {otherBoxes.map((box, protoIndex) => {
        return <PromoBox box={box} index={protoIndex >= boxid ? protoIndex + 1 : protoIndex} key={protoIndex} />;
      })}
    </section>
  );
}
