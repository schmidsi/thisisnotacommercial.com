import { Meteor } from 'meteor/meteor';
import {
  PaymentDirector,
  PaymentAdapter,
  PaymentError
} from 'meteor/unchained:core-payment';

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const payPalClient = require('./client');

const { PAYPAL_CLIENT_ID, PAYPAL_SECRET } = process.env;

class PaypalCheckout extends PaymentAdapter {
  static key = 'com.paypal.checkout';

  static label = 'PaypalCheckout';

  static version = '1.0';

  static initialConfiguration = [
    {
      key: 'description',
      value: 'Paypal/Credit Card'
    }
  ];

  static typeSupported(type) {
    return type === 'PAYPAL';
  }

  configurationError() {
    const publicCredentialsValid = PAYPAL_CLIENT_ID && PAYPAL_SECRET;

    if (!publicCredentialsValid) {
      return PaymentError.WRONG_CREDENTIALS;
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

  async clientToken() {
    return PAYPAL_CLIENT_ID;
  }

  async charge({ orderID }) {
    if (!orderID)
      throw new Error('You have to provide orderID in paymentContext');

    try {
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
      const order = await payPalClient.client().execute(request);

      console.log('PAYPAL ORDER', JSON.stringify(order.result, 2, null));

      const pricing = this.context.order.pricing();
      console.log('OUR ORDER', this.context.order);
      console.log('OUR PRICE', pricing);

      throw new Error('Blub');
    } catch (e) {
      console.error(e);
    }

    // if (!paypalPaymentMethodNonce)
    //   throw new Error(
    //     'You have to provide paypalPaymentMethodNonce in paymentContext'
    //   );
    // const braintree = require('braintree'); // eslint-disable-line
    // const gateway = this.gateway(braintree);
    // const address = this.context.order.billingAddress || {};
    // const pricing = this.context.order.pricing();
    // const rounded = Math.round(pricing.total().amount / 10 || 0) * 10;
    // const saleRequest = {
    //   amount: `${rounded / 100}.00`,
    //   // merchantAccountId: this.context.order.currency,
    //   paymentMethodNonce: paypalPaymentMethodNonce,
    //   orderId: this.context.order.orderNumber || this.context.order._id,
    //   shipping: {
    //     firstName: address.firstName,
    //     lastName: address.lastName,
    //     company: address.company,
    //     streetAddress: address.addressLine,
    //     extendedAddress: address.addressLine2,
    //     locality: address.city,
    //     region: address.regionCode,
    //     postalCode: address.postalCode,
    //     countryCodeAlpha2: address.countryCode
    //   },
    //   options: {
    //     submitForSettlement: true
    //   }
    // };
    // const result = await gateway.transaction.sale(saleRequest);
    // if (result.success) {
    //   return result;
    // }
    // this.log(saleRequest);
    // throw new Error(result.message);
  }
}

PaymentDirector.registerAdapter(PaypalCheckout);
