import { Meteor } from 'meteor/meteor';
import { startPlatform } from 'meteor/unchained:platform';
import { Users } from 'meteor/unchained:core-users';
import { Factory } from 'meteor/dburles:factory';
import configureEmailTemplates from './templates';

import 'meteor/unchained:core-delivery/plugins/send-mail';
import 'meteor/unchained:core-warehousing/plugins/google-sheets';
// import 'meteor/unchained:core-discounting/plugins/half-price';
import 'meteor/unchained:core-documents/plugins/smallinvoice';
import 'meteor/unchained:core-messaging/plugins/local-mail';
// import 'meteor/unchained:core-payment/plugins/invoice';
// import 'meteor/unchained:core-payment/plugins/paypal';
import 'meteor/unchained:core-payment/plugins/invoice-prepaid';
import 'meteor/unchained:core-pricing/plugins/order-items';
// import 'meteor/unchained:core-pricing/plugins/order-discount';
import 'meteor/unchained:core-pricing/plugins/order-delivery';
import 'meteor/unchained:core-pricing/plugins/order-payment';
import 'meteor/unchained:core-pricing/plugins/product-catalog-price';
// import 'meteor/unchained:core-pricing/plugins/product-discount';
// import 'meteor/unchained:core-pricing/plugins/product-swiss-tax';
import 'meteor/unchained:core-quotations/plugins/manual';
import 'meteor/thisisnotacommercial:pricing';
import 'meteor/thisisnotacommercial:paypal-checkout';
import 'meteor/thisisnotacommercial:coinbase';
// import 'meteor/thisisnotacommercial:braintree';

import { ProductTypes, ProductStatus } from 'meteor/unchained:core-products';
import { PaymentProviderType } from 'meteor/unchained:core-payment';

const logger = console;

const initializeDatabase = () => {
  const initialTimestamps = {
    created: new Date(),
    updated: null
  }

  try {
    if (Users.find({ username: 'admin' }).count() > 0) {
      return;
    }
    const admin = Factory.create('user', {
      username: 'admin',
      roles: ['admin'],
      emails: [{ address: 'admin@localhost', verified: true }],
      guest: false,
    ...initialTimestamps
    });
    const languages = ['en'].map((code, key) => {
      const isBase = key === 0;
      const language = Factory.create('language', {
        isoCode: code,
        isActive: true,
        isBase,
        authorId: admin._id,
        ...initialTimestamps
      });
      return language.isoCode;
    });
    const currencies = ['EUR'].map(code => {
      const currency = Factory.create('currency', {
        isoCode: code,
        isActive: true,
        authorId: admin._id,
        ...initialTimestamps
      });
      return currency._id;
    });
    const countries = ['CH'].map((code, key) => {
      const isBase = key === 0;
      const country = Factory.create('country', {
        isoCode: code,
        isBase,
        isActive: true,
        authorId: admin._id,
        defaultCurrencyId: currencies[key],
        ...initialTimestamps
      });
      return country.isoCode;
    });

    const paymentProviders = [
      Factory.create('paymentProvider', {
        adapterKey: () => 'com.coinbase',
        type: () => PaymentProviderType.PAYPAL,
        configuration: [
          { key: 'description', value: 'Cryptocurrencies (Coinbase)' }
        ],
        ...initialTimestamps
      }),
      Factory.create('paymentProvider', {
        adapterKey: () => 'com.paypal.checkout',
        type: () => PaymentProviderType.PAYPAL,
        configuration: [
          {
            key: 'description',
            value: 'Paypal/Credit Card'
          }
        ],
        ...initialTimestamps
      }),
      Factory.create('paymentProvider', {
        adapterKey: () => 'shop.unchained.invoice-prepaid',
        type: () => PaymentProviderType.INVOICE,
        configuration: [{ key: 'description', value: 'Pay via invoice' }],
        ...initialTimestamps
      })
    ];

    const deliveryProviders = [
      Factory.create('deliveryProvider', {
        configuration: [
          { key: 'from', value: 'orders@thisisnotacommercial.com' },
          { key: 'to', value: 'veliandamos@gmail.com' },
          { key: 'cc', value: 'simon@schmid.io' },
          { key: 'description', value: 'Free Shipping' }
        ],
        ...initialTimestamps
      })
    ];

    const postcardProduct = Factory.create('simpleProduct', {
      status: ProductStatus.ACTIVE,
      authorId: admin._id,
      published: new Date(),
      slugs: ['postcard'],
      tags: [],
      commerce: {
        pricing: [
          {
            currencyCode: 'EUR',
            countryCode: 'CH',
            amount: 25000,
            isTaxable: true,
            isNetPrice: false,
          }
        ]
      },
      ...initialTimestamps
    });

    const postcardText = Factory.create('productText', {
      productId: postcardProduct._id,
      locale: "en",
      title: "Postcard",
      vendor: "Veli & Amos",
      subtitle: "",
      slug: "Postcard",
      description: "",
      labels: [],
      ...initialTimestamps
    });

    logger.log(`
      initialized database with
      \ncountries: ${countries.join(',')}
      \ncurrencies: ${currencies.join(',')}
      \nlanguages: ${languages.join(',')}
      \nuser: admin@localhost / password`);
  } catch (e) {
    console.error(e);
    logger.log('database was already initialized');
  }
};

Meteor.startup(() => {
  configureEmailTemplates();
  initializeDatabase();
  startPlatform({ introspection: true });
});
