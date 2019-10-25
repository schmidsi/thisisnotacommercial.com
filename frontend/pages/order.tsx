import React, { Fragment, useState } from 'react';
import humanizeString from 'humanize-string';
import { Query, ApolloConsumer } from 'react-apollo';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Router from 'next/router';
import * as yup from 'yup';
import * as R from 'ramda';
// import DropIn from "braintree-web-drop-in-react";

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
  const [clientToken, setClientToken] = useState('');
  const [coinbaseChargeCode, setCoinbaseChargeCode] = useState();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalRendered, setPaypalRendered] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(false);
  const [paymentProviderInterface, setPaymentProviderInterface] = useState();

  const CoinbaseCommerceButton = (process as any).browser
    ? require('react-coinbase-commerce').default
    : () => <div />;

  return (
    <>
      <Query query={CurrentOrder} fetchPolicy="cache-and-network">
        {(result: any) => {
          const cart = R.pathOr({}, ['data', 'me', 'cart'], result);

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
            article: R.pathOr(
              '',
              ['items', 0, 'product', 'texts', 'title'],
              cart
            ),
            total: (R.pathOr('', ['total', 'amount'], cart) / 100).toFixed(2)
          };

          const supportedDeliveryProviders = (
            cart.supportedDeliveryProviders || []
          ).map(provider => ({
            id: provider._id,
            label: getProviderDescription(provider)
          }));

          const supportedPaymentProviders = (
            cart.supportedPaymentProviders || []
          ).map((provider: any) => ({
            id: provider._id,
            label: getProviderDescription(provider),
            interface: provider.interface.label
          }));

          const initialValues = {
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

            const type = R.pathOr(
              '',
              [
                'data',
                'setOrderPaymentProvider',
                'payment',
                'provider',
                'type'
              ],
              updatedOrder
            );
            const clientToken = R.pathOr(
              '',
              ['data', 'setOrderPaymentProvider', 'payment', 'clientToken'],
              updatedOrder
            );

            setClientToken(clientToken);

            const providerInterface =
              paymentProviderIdMap[paymentProviderId as any];

            setPaymentProviderInterface(providerInterface);
          };

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
                    Please review the order details and confirm your payment
                    method below.{' '}
                  </h2>
                  <h2>Your order:</h2>
                  <dl className={css.dl}>
                    {R.toPairs(order).map(([name, value]) => (
                      <Fragment key={`${name}-${value}`}>
                        <div>
                          <dt key={'dt-' + name}>{humanizeString(name)}:</dt>
                          <dd key={'dd-' + name}>{value}</dd>
                        </div>
                      </Fragment>
                    ))}
                  </dl>
                  <ApolloConsumer>
                    {client => (
                      <Formik
                        initialValues={initialValues}
                        onSubmit={async (values, { setSubmitting }) => {
                          const paymentContext: any = {};

                          const providerInterface =
                            paymentProviderIdMap[
                              values.paymentProviderId as any
                            ];

                          if (providerInterface === 'Coinbase') {
                            paymentContext.chargeCode = coinbaseChargeCode;
                          }

                          if (providerInterface === 'PaypalCheckout') {
                            paymentContext.orderID = paypalOrderId;
                          }

                          await client.mutate({
                            mutation: SetOrderDeliveryProvider,
                            variables: {
                              deliveryProviderId: R.path(
                                [0, 'id'],
                                supportedDeliveryProviders
                              ), // values.deliveryProviderId,
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
                        }}
                        validationSchema={yup.object().shape({
                          paymentProviderId: yup.string().required()
                          // deliveryProviderId: yup.string().required()
                        })}
                      >
                        {({ isSubmitting, submitForm }) => {
                          if (
                            (process as any).browser &&
                            !paypalLoaded &&
                            paymentProviderInterface === 'PaypalCheckout'
                          ) {
                            const script = document.createElement('script');
                            script.type = 'application/javascript';
                            script.src = `https://www.paypal.com/sdk/js?client-id=${clientToken}&currency=${
                              order.currency
                            }`;
                            script.onload = e => {
                              setPaypalLoaded(true);
                            };
                            document.body.appendChild(script);
                          }

                          paymentProviderInterface === 'PaypalCheckout' &&
                            paypalLoaded &&
                            window.setTimeout(() => {
                              !paypalRendered &&
                                (window as any).paypal
                                  .Buttons({
                                    createOrder: function(data, actions) {
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
                                            description:
                                              'Custom art painting by Veli & Amos and friends',
                                            shipping: {
                                              name: {
                                                full_name: `${
                                                  order.firstName
                                                } ${order.lastName}`
                                              },
                                              address: {
                                                address_line_1:
                                                  order.addressLine,
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
                                      return actions.order
                                        .capture()
                                        .then(function(details) {
                                          // Show a success message to your buyer
                                          setPaypalOrderId(data.orderID);
                                          submitForm();
                                        });
                                    }
                                  })
                                  .render('#paypal-checkout');
                            }, 100);

                          return isSubmitting ? (
                            <img src="/static/spinner.gif" />
                          ) : (
                            <Form>
                              <h2>Payment</h2>
                              <ErrorMessage
                                name="paymentProviderId"
                                component="div"
                              />
                              <Field name="paymentProviderId">
                                {({ field }) => (
                                  <div className={css.paymentOption}>
                                    {supportedPaymentProviders.map(
                                      (provider: any) => (
                                        <label key={provider.id}>
                                          <input
                                            type="radio"
                                            value={provider.id}
                                            name={field.name}
                                            onChange={e =>
                                              setPaymentProvider(
                                                client,
                                                provider.id
                                              ) && field.onChange(e)
                                            }
                                            checked={
                                              field.value === provider.id
                                            }
                                          />
                                          {provider.label}
                                        </label>
                                      )
                                    )}
                                  </div>
                                )}
                              </Field>

                              {/* <h2>Delivery</h2>
                          <ErrorMessage
                            name="deliveryProviderId"
                            component="div"
                          />
                          <Field name="deliveryProviderId">
                            {({ field }) =>
                              supportedDeliveryProviders.map(
                                (provider: any) => (
                                  <label key={provider.id}>
                                    <input
                                      type="radio"
                                      value={provider.id}
                                      name={field.name}
                                      onChange={field.onChange}
                                      checked={field.value === provider.id}
                                    />
                                    {provider.label}
                                  </label>
                                )
                              )
                            }
                          </Field> */}
                              {clientToken &&
                                paymentProviderInterface === 'Coinbase' && (
                                  <CoinbaseCommerceButton
                                    styled
                                    checkoutId={clientToken}
                                    onChargeSuccess={({ code }) => {
                                      setCoinbaseChargeCode(code);
                                      submitForm();
                                    }}
                                  />
                                )}
                              {clientToken &&
                                paymentProviderInterface ===
                                  'PaypalCheckout' && (
                                  <div id="paypal-checkout" />
                                )}

                              {paymentProviderInterface ===
                                'Invoice Prepaid (manually)' && (
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className={css.button}
                                  style={{ marginTop: 0 }}
                                >
                                  Submit
                                </button>
                              )}
                            </Form>
                          );
                        }}
                      </Formik>
                    )}
                  </ApolloConsumer>
                </div>
              )}

              <img
                style={{ marginTop: 50 }}
                src="/static/free-shipping.png"
                alt="Free shipping - world wide"
              />
              <a href="mailto:veliandamos@gmail.com">
                <img
                  src="/static/mail.png"
                  alt="If you have any questions, mail us"
                />
              </a>
            </div>
          );
        }}
      </Query>
    </>
  );
};

export default Order;
