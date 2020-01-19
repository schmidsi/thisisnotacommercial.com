import React, { Fragment, useState, useEffect } from 'react';
import humanizeString from 'humanize-string';
import { useFormik } from 'formik';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import Router from 'next/router';
import * as yup from 'yup';
import * as R from 'ramda';
import * as Sentry from '@sentry/browser';

import CurrentOrder from '../queries/CurrentOrder.gql';
import SetOrderPaymentProvider from '../queries/SetOrderPaymentProvider.gql';
import SetOrderDeliveryProvider from '../queries/SetOrderDeliveryProvider.gql';
import CheckoutCart from '../queries/CheckoutCart.gql';

import css from './main.css';

const getProviderDescription = provider => {
  const description = provider.configuration.find(c => c.key === 'description');

  if (description) {
    return description.value;
  } else {
    console.warn('No description provided for provider:', provider);
    return '';
  }
};

const Order = () => {
  const client = useApolloClient();
  const [clientToken, setClientToken] = useState('');
  const [coinbaseChargeCode, setCoinbaseChargeCode] = useState();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalRendered, setPaypalRendered] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(false);
  const [paymentProviderInterface, setPaymentProviderInterface] = useState();
  const result = useQuery(CurrentOrder, { fetchPolicy: 'cache-and-network' });

  const cart: any = R.pathOr({}, ['data', 'me', 'cart'], result);

  const order = {
    firstName: R.pathOr('', ['billingAddress', 'firstName'], cart),
    lastName: R.pathOr('', ['billingAddress', 'lastName'], cart),
    addressLine: R.pathOr('', ['billingAddress', 'addressLine'], cart),
    postalCode: R.pathOr('', ['billingAddress', 'postalCode'], cart),
    countryCode: R.pathOr('', ['billingAddress', 'countryCode'], cart),
    city: R.pathOr('', ['billingAddress', 'city'], cart),
    emailAddress: R.pathOr('', ['contact', 'emailAddress'], cart),
    message: R.pathOr('', ['meta', 'message'], cart),
    currency: R.pathOr('', ['total', 'currency'], cart),
    article: R.pathOr('', ['items', 0, 'product', 'texts', 'title'], cart),
    description: R.pathOr('', ['items', 0, 'product', 'texts', 'title'], cart)
      .toLowerCase()
      .includes('postcard')
      ? 'Custom art painting by Veli & Amos and friends'
      : 'A full page in the upcoming book by Veli & Amos with Edition Patrick Frey',
    // TODO: Use description from DB. Does not work with Control Panel currently
    //
    // description: R.pathOr(
    //   '',
    //   ['items', 0, 'product', 'texts', 'subtitle'],
    //   cart
    // ),
    total: (R.pathOr(0, ['total', 'amount'], cart) / 100).toFixed(2)
  };

  const image = R.path(['documents', 0], cart);

  const supportedDeliveryProviders = (
    cart.supportedDeliveryProviders || []
  ).map(provider => ({
    id: provider._id,
    label: getProviderDescription(provider)
  }));

  const supportedPaymentProviders = (cart.supportedPaymentProviders || []).map(
    (provider: any) => ({
      id: provider._id,
      label: getProviderDescription(provider),
      interface: provider.interface.label
    })
  );

  const initialValues = {
    paymentProviderId: ''
    // paymentProviderId: R.path(["payment", "provider", "_id"], cart)
    // deliveryProviderId:
    //   R.path(["delivery", "provider", "_id"], cart) ||
    //   R.path([0, "id"], supportedDeliveryProviders)
  };

  const paymentProviderIdMap = supportedPaymentProviders.reduce(
    (carry, current) => ({ ...carry, [current.id]: current.interface }),
    {}
  );

  const setPaymentProvider = async (client, paymentProviderId) => {
    const updatedOrder = await client.mutate({
      mutation: SetOrderPaymentProvider,
      variables: {
        paymentProviderId,
        orderId: cart._id
      }
    });

    // const type = R.pathOr(
    //   '',
    //   ['data', 'setOrderPaymentProvider', 'payment', 'provider', 'type'],
    //   updatedOrder
    // );

    const clientToken = R.pathOr(
      '',
      ['data', 'setOrderPaymentProvider', 'payment', 'clientToken'],
      updatedOrder
    );

    setClientToken(clientToken);

    const providerInterface = paymentProviderIdMap[paymentProviderId as any];

    setPaymentProviderInterface(providerInterface);
  };

  const CoinbaseCommerceButton = (process as any).browser
    ? require('react-coinbase-commerce').default
    : () => <div />;

  const formik = useFormik({
    initialValues,
    validationSchema: yup.object().shape({
      paymentProviderId: yup.string().required()
      // deliveryProviderId: yup.string().required()
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const paymentContext: any = {};

      const providerInterface =
        paymentProviderIdMap[values.paymentProviderId as any];

      if (providerInterface === 'Coinbase') {
        paymentContext.chargeCode = coinbaseChargeCode;
      }

      if (providerInterface === 'PaypalCheckout') {
        paymentContext.orderID = paypalOrderId;
      }

      await client.mutate({
        mutation: SetOrderDeliveryProvider,
        variables: {
          deliveryProviderId: R.path([0, 'id'], supportedDeliveryProviders), // values.deliveryProviderId,
          orderId: cart._id
        }
      });

      await client.mutate({
        mutation: CheckoutCart,
        variables: {
          paymentContext
        }
      });

      setSubmitting(false);

      Router.push({
        pathname: '/thankyou'
      });
    }
  });

  useEffect(() => {
    if (
      (process as any).browser &&
      !paypalLoaded &&
      paymentProviderInterface === 'PaypalCheckout'
    ) {
      const script = document.createElement('script');
      script.type = 'application/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientToken}&currency=${order.currency}`;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [paymentProviderInterface]);

  useEffect(() => {
    paymentProviderInterface === 'PaypalCheckout' &&
      paypalLoaded &&
      window.setTimeout(() => {
        !paypalRendered &&
          (window as any).paypal
            .Buttons({
              createOrder: function(_, actions) {
                setPaypalRendered(true);
                // Set up the transaction
                return actions.order.create({
                  intent: 'CAPTURE',
                  payer: {
                    email_address: order.emailAddress
                  },
                  purchase_units: [
                    {
                      amount: {
                        value: order.total
                      },
                      description: order.description,
                      shipping: {
                        name: {
                          full_name: `${order.firstName} ${order.lastName}`
                        },
                        address: {
                          address_line_1: order.addressLine,
                          admin_area_2: order.city,
                          postal_code: order.postalCode,
                          country_code: order.countryCode
                        }
                      }
                    }
                  ]
                });
              },
              onApprove: function(data, actions) {
                // Capture the funds from the transaction
                return actions.order.capture().then(function(__) {
                  // Show a success message to your buyer
                  setPaypalOrderId(data.orderID);
                  formik.submitForm();
                });
              },
              onError: function(error) {
                Sentry.captureException(error);
              }
            })
            .render('#paypal-checkout');
      }, 100);
  }, [paymentProviderInterface, paypalLoaded]);

  return (
    <div className={css.container} key="main">
      <header className={css.header}>
        <div className={css.logoHolder}>
          <img
            src="/static/logo.jpg"
            alt="This is not a commercial logo"
            className={css.logoOrder}
          />
        </div>
      </header>

      {result.loading ? (
        <img src="/static/spinner.gif" />
      ) : (
        <div>
          <h2>
            Please review the order details and confirm your payment method
            below.{' '}
          </h2>
          <h2>Your order:</h2>
          <dl className={css.dl}>
            {image && (
              <div>
                <dt>Image:</dt>
                <dd>
                  <img src={(image as any).url} />
                </dd>
              </div>
            )}
            {R.toPairs(order).map(([name, value]) => (
              <Fragment key={`${name}-${value}`}>
                <div>
                  <dt key={'dt-' + name}>{humanizeString(name)}:</dt>
                  <dd key={'dd-' + name}>{value}</dd>
                </div>
              </Fragment>
            ))}
          </dl>

          {formik.isSubmitting ? (
            <img src="/static/spinner.gif" />
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <h2>Payment</h2>
              {formik.touched.paymentProviderId &&
              formik.errors.paymentProviderId ? (
                <div className={css.labelError}>
                  {formik.errors.paymentProviderId}
                </div>
              ) : null}

              <div className={css.paymentOption}>
                {supportedPaymentProviders.map((provider: any) => (
                  <label key={provider.id}>
                    <input
                      type="radio"
                      value={provider.id}
                      name="paymentProviderId"
                      onChange={e =>
                        setPaymentProvider(client, provider.id) &&
                        formik.handleChange(e)
                      }
                      checked={formik.values.paymentProviderId === provider.id}
                    />
                    {provider.label}
                  </label>
                ))}
              </div>

              {clientToken && paymentProviderInterface === 'Coinbase' && (
                <CoinbaseCommerceButton
                  styled
                  checkoutId={clientToken}
                  onChargeSuccess={({ code }) => {
                    setCoinbaseChargeCode(code);
                    formik.submitForm();
                  }}
                />
              )}

              {clientToken && paymentProviderInterface === 'PaypalCheckout' && (
                <div id="paypal-checkout" />
              )}

              {paymentProviderInterface === 'Invoice Prepaid (manually)' && (
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className={css.button}
                  style={{ marginTop: 0 }}
                >
                  Submit
                </button>
              )}
            </form>
          )}
        </div>
      )}

      <img
        style={{ marginTop: 50 }}
        src="/static/free-shipping.png"
        alt="Free shipping - world wide"
      />
      <a href="mailto:veliandamos@gmail.com">
        <img src="/static/mail.png" alt="If you have any questions, mail us" />
      </a>
    </div>
  );
};

export default Order;
