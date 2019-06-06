import coinbase from 'coinbase-commerce-node';

import {
  PaymentDirector,
  PaymentAdapter,
  PaymentError
} from 'meteor/unchained:core-payment';

const { COINBASE_COMMERCE_KEY } = process.env;

class Coinbase extends PaymentAdapter {
  static key = 'com.coinbase';

  static label = 'Coinbase';

  static version = '1.0';

  static initialConfiguration = [
    {
      key: 'description',
      value: 'Cryptocurrencies (Coinbase)'
    }
  ];

  static typeSupported(type) {
    return type === 'PAYPAL';
  }

  configurationError() {
    const publicCredentialsValid = !!COINBASE_COMMERCE_KEY;

    if (!publicCredentialsValid) {
      return PaymentError.WRONG_CREDENTIALS;
    }

    try {
      coinbase.Client.init(COINBASE_COMMERCE_KEY);
    } catch (e) {
      console.error(e);
      this.log(e);
      return PaymentError.INCOMPLETE_CONFIGURATION;
    }
    return null;
  }

  isActive() {
    if (!this.configurationError()) return true;
    return false;
  }

  isPayLaterAllowed() {
    // eslint-disable-line
    return false;
  }

  // HACK: We abuse the Paypal type to use clientToken for checkoutId
  // https://github.com/coinbase/coinbase-commerce-node#create
  async clientToken() {
    console.log('clientToken', this);

    const pricing = this.context.order.pricing();
    const rounded = Math.round(pricing.total().amount / 10 || 0) * 10;

    const checkout = await coinbase.resources.Checkout.create({
      name: 'Postcard',
      description: 'Handpainted by Veli & Amos and friends',
      pricing_type: 'fixed_price',
      local_price: {
        amount: `${rounded / 100}.00`,
        currency: this.context.order.currency
      }
    });

    console.log(checkout);

    return checkout.id;
  }

  async charge({ chargeId }) {
    const charge = await coinbase.resources.Charge.retrieve(chargeId);

    const completed = !!charge.timeline.find(
      (statusUpdate = statusUpdate.status === 'COMPLETED')
    );

    if (completed) {
      return charge;
    }
    console.log(charge);
    throw new Error('Charge not completed');
  }
}

PaymentDirector.registerAdapter(Coinbase);
