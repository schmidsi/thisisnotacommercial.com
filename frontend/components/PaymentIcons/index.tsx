import React from 'react';

import css from './style.css';

const PaymentIcons = () => {
  return (
    <div>
      <img src="/static/free-shipping.png" alt="Free shipping - world wide" />
      <img
        className={css.paymentIcons}
        src="/static/bitcoin.png"
        alt="bitcoin"
      />
      <img
        className={css.paymentIcons}
        src="/static/litecoin-ether.png"
        alt="litecoin and ether"
      />
      <img
        className={css.paymentIcons}
        src="/static/paypal_cc.png"
        alt="CC payment methods"
      />
      <a href="mailto:veliandamos@gmail.com">
        <img src="/static/mail.png" alt="If you have any questions, mail us" />
      </a>
    </div>
  );
};

export default PaymentIcons;
