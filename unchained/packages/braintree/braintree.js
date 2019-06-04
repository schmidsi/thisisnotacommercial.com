import { Meteor } from 'meteor/meteor';
import {
  PaymentDirector,
  PaymentAdapter,
  PaymentError
} from 'meteor/unchained:core-payment';

const {
  BRAINTREE_PRIVATE_KEY,
  BRAINTREE_PUBLIC_KEY,
  BRAINTREE_MERCHANT_ID
} = process.env;

class Braintree extends PaymentAdapter {
  static key = 'com.braintree';

  static label = 'Braintree';

  static version = '1.0';

  static initialConfiguration = [
    {
      key: 'description',
      value: 'Paypal/Credit Card'
    }
  ];

  static typeSupported(type) {
    return type === 'PAYPAL' || type === 'CARD';
  }

  configurationError() {
    const publicCredentialsValid =
      BRAINTREE_MERCHANT_ID && BRAINTREE_PUBLIC_KEY && BRAINTREE_PRIVATE_KEY;

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

  gateway(braintree) {
    return braintree.connect({
      environment: Meteor.isProduction
        ? braintree.Environment.Production
        : braintree.Environment.Sandbox,
      merchantId: BRAINTREE_MERCHANT_ID,
      publicKey: BRAINTREE_PUBLIC_KEY,
      privateKey: BRAINTREE_PRIVATE_KEY
    });
  }

  async clientToken() {
    const braintree = require('braintree'); // eslint-disable-line
    const gateway = this.gateway(braintree);
    const result = await gateway.clientToken.generate({});
    if (result.success) {
      return result.clientToken;
    }
    throw new Error('Could not retrieve the client token');
  }

  async charge({ paypalPaymentMethodNonce }) {
    if (!paypalPaymentMethodNonce)
      throw new Error(
        'You have to provide paypalPaymentMethodNonce in paymentContext'
      );
    const braintree = require('braintree'); // eslint-disable-line
    const gateway = this.gateway(braintree);
    const address = this.context.order.billingAddress || {};
    const pricing = this.context.order.pricing();
    const rounded = Math.round(pricing.total().amount / 10 || 0) * 10;
    const saleRequest = {
      amount: rounded / 100,
      merchantAccountId: this.context.order.currency,
      paymentMethodNonce: paypalPaymentMethodNonce,
      orderId: this.context.order.orderNumber || this.context.order._id,
      shipping: {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        streetAddress: address.addressLine,
        extendedAddress: address.addressLine2,
        locality: address.city,
        region: address.regionCode,
        postalCode: address.postalCode,
        countryCodeAlpha2: address.countryCode
      },
      options: {
        submitForSettlement: true
      }
    };

    const result = await gateway.transaction.sale(saleRequest);
    if (result.success) {
      return result;
    }

    this.log(saleRequest);
    throw new Error(result.message);
  }
}

PaymentDirector.registerAdapter(Braintree);
