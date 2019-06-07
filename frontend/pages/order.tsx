import React, { Fragment, useState } from "react";
// import ReactDOM from "react-dom";
import { Query, ApolloConsumer } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Router from "next/router";
import * as yup from "yup";
import * as R from "ramda";
// import DropIn from "braintree-web-drop-in-react";

import CurrentOrder from "../queries/CurrentOrder.gql";
import SetOrderPaymentProvider from "../queries/SetOrderPaymentProvider.gql";
import SetOrderDeliveryProvider from "../queries/SetOrderDeliveryProvider.gql";
import CheckoutCart from "../queries/CheckoutCart.gql";

import css from "./main.css";

const getProviderDescription = provider => {
  const description = provider.configuration.find(c => c.key === "description");

  if (description) {
    return description.value;
  } else {
    console.warn("No description provided for provider:", provider);
    return "";
  }
};

const Order = () => {
  const [clientToken, setClientToken] = useState("");
  const [coinbaseChargeCode, setCoinbaseChargeCode] = useState();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalRendered, setPaypalRendered] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(false);
  const [paymentProviderInterface, setPaymentProviderInterface] = useState();

  const CoinbaseCommerceButton = (process as any).browser
    ? require("react-coinbase-commerce").default
    : () => <div />;

  // const PayPalButton =
  //   (process as any).browser && paypalLoaded ? (
  //     (window as any).paypal.Buttons.driver("react", { React, ReactDOM })
  //   ) : (
  //     <div />
  //   );

  // console.log(PayPalButton);

  return (
    <>
      <Query query={CurrentOrder}>
        {(result: any) => {
          const cart = R.pathOr({}, ["data", "me", "cart"], result);

          const order = {
            firstName: R.pathOr("", ["billingAddress", "firstName"], cart),
            lastName: R.pathOr("", ["billingAddress", "lastName"], cart),
            addressLine: R.pathOr("", ["billingAddress", "addressLine"], cart),
            postalCode: R.pathOr("", ["billingAddress", "postalCode"], cart),
            countryCode: R.pathOr("", ["billingAddress", "countryCode"], cart),
            city: R.pathOr("", ["billingAddress", "city"], cart),
            emailAddress: R.pathOr("", ["contact", "emailAddress"], cart),
            message: R.pathOr("", ["meta", "message"], cart),
            total: (R.pathOr("", ["total", "amount"], cart) / 100).toFixed(2),
            currency: R.pathOr("", ["total", "currency"], cart)
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

          // console.log(R.path([0, "id"], supportedDeliveryProviders));

          const initialValues = {
            paymentProviderId: R.path(["payment", "provider", "_id"], cart)
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
              "",
              [
                "data",
                "setOrderPaymentProvider",
                "payment",
                "provider",
                "type"
              ],
              updatedOrder
            );
            const clientToken = R.pathOr(
              "",
              ["data", "setOrderPaymentProvider", "payment", "clientToken"],
              updatedOrder
            );

            setClientToken(clientToken);

            const providerInterface =
              paymentProviderIdMap[paymentProviderId as any];

            setPaymentProviderInterface(providerInterface);

            console.log({ type, clientToken });
          };

          return (
            <div className={css.container} key="main">
              <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
              <h1>Your order</h1>
              <dl>
                {R.toPairs(order).map(([name, value]) => (
                  <Fragment key={`${name}-${value}`}>
                    <dt key={"dt-" + name}>{name}</dt>
                    <dd key={"dd-" + name}>{value}</dd>
                  </Fragment>
                ))}
              </dl>
              <ApolloConsumer>
                {client => (
                  <Formik
                    initialValues={initialValues}
                    onSubmit={async (values, { setSubmitting }) => {
                      console.log("submit", values);

                      const paymentContext: any = {};

                      const providerInterface =
                        paymentProviderIdMap[values.paymentProviderId as any];

                      if (providerInterface === "Coinbase") {
                        paymentContext.chargeCode = coinbaseChargeCode;
                      }

                      console.log({ providerInterface, paypalOrderId });

                      if (providerInterface === "PaypalCheckout") {
                        paymentContext.orderID = paypalOrderId;
                      }

                      await client.mutate({
                        mutation: SetOrderDeliveryProvider,
                        variables: {
                          deliveryProviderId: R.path(
                            [0, "id"],
                            supportedDeliveryProviders
                          ), // values.deliveryProviderId,
                          orderId: cart._id
                        }
                      });

                      console.log(paymentContext);

                      await client.mutate({
                        mutation: CheckoutCart,
                        variables: {
                          paymentContext
                        }
                      });

                      setSubmitting(false);

                      Router.push({
                        pathname: "/thankyou"
                      });
                    }}
                    validationSchema={yup.object().shape({
                      paymentProviderId: yup.string().required()
                      // deliveryProviderId: yup.string().required()
                    })}
                  >
                    {({ isSubmitting, submitForm, validateForm, values }) => {
                      if (
                        (process as any).browser &&
                        !paypalLoaded &&
                        paymentProviderInterface === "PaypalCheckout"
                      ) {
                        const script = document.createElement("script");
                        script.type = "application/javascript";
                        script.src = `https://www.paypal.com/sdk/js?client-id=${clientToken}&currency=${
                          order.currency
                        }`;
                        script.onload = e => {
                          console.log(e, (window as any).paypal);
                          setPaypalLoaded(true);
                        };
                        document.body.appendChild(script);
                      }

                      paymentProviderInterface === "PaypalCheckout" &&
                        paypalLoaded &&
                        window.setTimeout(() => {
                          !paypalRendered &&
                            (window as any).paypal
                              .Buttons({
                                createOrder: function(data, actions) {
                                  setPaypalRendered(true);
                                  // Set up the transaction
                                  return actions.order.create({
                                    intent: "CAPTURE",
                                    payer: {
                                      name: {
                                        given_name: order.firstName,
                                        surname: order.lastName
                                      },
                                      email_address: order.emailAddress,
                                      address: {
                                        address_line_1: order.addressLine,
                                        admin_area_2: order.city,
                                        postal_code: order.postalCode,
                                        country_code: order.countryCode
                                      }
                                    },
                                    purchase_units: [
                                      {
                                        amount: {
                                          value: order.total
                                        },
                                        description:
                                          "Custom art painting by Veli & Amos and friends"
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
                                      console.log(data, actions, details);
                                      setPaypalOrderId(data.orderID);
                                      console.log(
                                        "after set paypala order id",
                                        data.orderID,
                                        paypalOrderId
                                      );
                                      submitForm();
                                    });
                                }
                              })
                              .render("#paypal-checkout");
                        }, 100);

                      return (
                        <Form>
                          {isSubmitting}
                          <h2>Payment</h2>
                          <ErrorMessage
                            name="paymentProviderId"
                            component="div"
                          />
                          <Field name="paymentProviderId">
                            {({ field }) => (
                              <Fragment>
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
                                        checked={field.value === provider.id}
                                      />
                                      {provider.label}
                                    </label>
                                  )
                                )}
                              </Fragment>
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
                            paymentProviderInterface === "Coinbase" && (
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
                            paymentProviderInterface === "PaypalCheckout" && (
                              <div id="paypal-checkout" />
                            )}

                          {paymentProviderInterface ===
                            "Invoice Prepaid (manually)" && (
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className={css.button}
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
          );
        }}
      </Query>
    </>
  );
};

export default Order;
