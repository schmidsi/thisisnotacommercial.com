import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom";
import { Query, ApolloConsumer } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Router from "next/router";
import * as yup from "yup";
import * as R from "ramda";
import DropIn from "braintree-web-drop-in-react";

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
  const [braintreeInstance, setBraintreeInstance] = useState();
  const [coinbaseChargeCode, setCoinbaseChargeCode] = useState();
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  if ((process as any).browser) {
    const script = document.createElement("script");
    script.type = "application/javascript";
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AZRXnT8N0lHETThEPR5XVvMB_yJ8S7KpWA_gdwCb80IRJsDv6MhtQVnyle9gfIDadQGCNSLv_-f7b8Vc";
    script.onload = e => {
      console.log(e, (window as any).paypal);
      setPaypalLoaded(true);
    };
    document.body.appendChild(script);
  }

  const CoinbaseCommerceButton = (process as any).browser
    ? require("react-coinbase-commerce")
    : () => <div />;

  const PayPalButton =
    (process as any).browser && paypalLoaded ? (
      (window as any).paypal.Buttons.driver("react", { React, ReactDOM })
    ) : (
      <div />
    );

  return (
    <>
      <Query query={CurrentOrder}>
        {(result: any) => {
          const cart = R.pathOr({}, ["data", "me", "cart"], result);

          // if ((process as any).browser) {
          //   console.log(window.paypal);

          //   const CoinbaseCommerceButton = require("react-coinbase-commerce");
          // }

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

          const initialValues = {
            paymentProviderId: R.path(["payment", "provider", "_id"], cart),
            deliveryProviderId: R.path(["delivery", "provider", "_id"], cart)
          };

          const supportedPaymentProviders = (
            cart.supportedPaymentProviders || []
          ).map((provider: any) => ({
            id: provider._id,
            label: getProviderDescription(provider),
            interface: provider.interface.label
          }));

          const supportedDeliveryProviders = (
            cart.supportedDeliveryProviders || []
          ).map(provider => ({
            id: provider._id,
            label: getProviderDescription(provider)
          }));

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

            // Reset the braintree instance. It will be set by the braintree widget after loading
            setBraintreeInstance(null);

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
                      const paymentContext: any = {};

                      const providerInterface =
                        paymentProviderIdMap[values.paymentProviderId as any];

                      if (providerInterface === "Braintree") {
                        const result = await braintreeInstance.requestPaymentMethod();
                        paymentContext.paypalPaymentMethodNonce = result.nonce;
                      }

                      if (providerInterface === "Coinbase") {
                        paymentContext.chargeCode = coinbaseChargeCode;
                      }

                      await client.mutate({
                        mutation: SetOrderDeliveryProvider,
                        variables: {
                          deliveryProviderId: values.deliveryProviderId,
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
                      paymentProviderId: yup.string().required(),
                      deliveryProviderId: yup.string().required()
                    })}
                  >
                    {({ isSubmitting, submitForm, validateForm, values }) => (
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
                              {clientToken &&
                                paymentProviderIdMap[field.value] ===
                                  "Braintree" && (
                                  <DropIn
                                    options={{
                                      authorization: clientToken,
                                      paypal: {
                                        flow: "checkout",
                                        amount: order.total,
                                        currency: order.currency
                                      }
                                    }}
                                    onInstance={setBraintreeInstance}
                                  />
                                )}
                            </Fragment>
                          )}
                        </Field>

                        <h2>Delivery</h2>
                        <ErrorMessage
                          name="deliveryProviderId"
                          component="div"
                        />
                        <Field name="deliveryProviderId">
                          {({ field }) =>
                            supportedDeliveryProviders.map((provider: any) => (
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
                            ))
                          }
                        </Field>
                        {clientToken &&
                        paymentProviderIdMap[
                          values.paymentProviderId as string
                        ] === "Coinbase" ? (
                          <CoinbaseCommerceButton
                            styled
                            checkoutId={clientToken}
                            onLoad={async () => {
                              const valid = await validateForm();
                              console.log({ valid });
                              if (!R.isEmpty(valid)) throw new Error("CLOSE")!;
                            }}
                            onChargeSuccess={({ code }) => {
                              setCoinbaseChargeCode(code);
                              submitForm();
                            }}
                          />
                        ) : (
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={css.button}
                          >
                            Submit
                          </button>
                        )}
                      </Form>
                    )}
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
