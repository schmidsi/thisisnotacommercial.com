import { Query, ApolloConsumer } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import * as R from "ramda";

import CurrentOrder from "../queries/CurrentOrder.gql";
import SetOrderPaymentProvider from "../queries/SetOrderPaymentProvider.gql";
import CheckoutCart from "../queries/CheckoutCart.gql";

import css from "./main.css";

const Order = () => (
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
        total: (R.pathOr("", ["total", "amount"], cart) / 100).toFixed(2)
      };

      const initialValues = {
        paymentProviderId: R.path(["payment", "provider", "_id"], cart)
      };

      const supportedPaymentProviders = (
        cart.supportedPaymentProviders || []
      ).map((provider: any) => ({
        id: provider._id,
        label: provider.interface.label
      }));

      console.log({ result, order, initialValues, supportedPaymentProviders });

      return (
        <div className={css.container}>
          <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
          <h1>Your order</h1>
          <dl>
            {R.toPairs(order).map(([name, value]) => (
              <>
                <dt key={"dt-" + name}>{name}</dt>
                <dd key={"dd-" + name}>{value}</dd>
              </>
            ))}
          </dl>
          <ApolloConsumer>
            {client => (
              <Formik
                initialValues={initialValues}
                onSubmit={async (values, { setSubmitting }) => {
                  await client.mutate({
                    mutation: SetOrderPaymentProvider,
                    variables: {
                      paymentProviderId: values.paymentProviderId,
                      orderId: cart._id
                    }
                  });

                  console.log(
                    await client.mutate({
                      mutation: CheckoutCart
                    })
                  );

                  console.log(values);
                  setSubmitting(false);
                }}
                validationSchema={yup
                  .object()
                  .shape({ paymentProviderId: yup.string().required() })}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {isSubmitting}
                    <h2>Payment</h2>
                    <ErrorMessage name="paymentProviderId" component="div" />
                    <Field name="paymentProviderId">
                      {({ field }) =>
                        supportedPaymentProviders.map((provider: any) => (
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

                    <h2>Delivery</h2>
                    <ErrorMessage name="paymentProviderId" component="div" />
                    <Field name="paymentProviderId">
                      {({ field }) =>
                        supportedPaymentProviders.map((provider: any) => (
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={css.button}
                    >
                      Submit
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </ApolloConsumer>
        </div>
      );
    }}
  </Query>
);

export default Order;
