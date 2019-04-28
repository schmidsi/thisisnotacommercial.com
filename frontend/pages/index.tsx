import React from "react";
import { Query, ApolloConsumer } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import * as R from "ramda";

import CurrentPrice from "../queries/CurrentPrice.gql";
import LoginAsGuest from "../queries/LoginAsGuest.gql";
import AddCartProduct from "../queries/AddCartProduct.gql";
import UpdateCart from "../queries/UpdateCart.gql";

import css from "./index.css";

const Home = () => (
  <Query query={CurrentPrice}>
    {(result: any) => {
      const price = R.pathOr(
        0,
        ["data", "product", "simulatedPrice", "price", "amount"],
        result
      );

      const productId = R.path(["data", "product", "_id"], result);

      return (
        <div className={css.container}>
          <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
          <h1>This is not a commercial</h1>
          <div>Current price: {price / 100}€</div>

          <h1>Order</h1>
          <ApolloConsumer>
            {client => (
              <Formik
                initialValues={{
                  firstName: "Hans",
                  lastName: "Muster",
                  addressLine: "Bahnhofstrasse 1",
                  postalCode: "8001",
                  countryCode: "CH",
                  city: "Zürich",
                  emailAddress: "asdf@asdf.ch"
                  // message: "Test"
                }}
                validationSchema={yup.object().shape({
                  firstName: yup.string().required(),
                  lastName: yup.string().required(),
                  addressLine: yup.string().required(),
                  postalCode: yup.string().required(),
                  countryCode: yup.string().required(),
                  city: yup.string().required(),
                  emailAddress: yup
                    .string()
                    .email("Invalid email address")
                    .required("Please provide an email address"),
                  message: yup.string()
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  console.log(values, client);

                  const loginAsGuestResult = await client.mutate({
                    mutation: LoginAsGuest
                  });

                  const token = R.pathOr(
                    "",
                    ["data", "loginAsGuest", "token"],
                    loginAsGuestResult
                  );

                  if (window) window.localStorage.setItem("token", token);

                  const addCartProductResult = await client.mutate({
                    mutation: AddCartProduct,
                    variables: { productId }
                  });

                  console.log(addCartProductResult);

                  const updateCartResult = await client.mutate({
                    mutation: UpdateCart,
                    variables: values
                  });

                  console.log(updateCartResult);

                  setSubmitting(false);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {/* {console.log(values)} */}
                    <label>
                      <h2 className={css.label}>First Name</h2>
                      <ErrorMessage name="firstName" component="div" />
                      <Field
                        type="string"
                        name="firstName"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Last Name</h2>
                      <ErrorMessage name="lastName" component="div" />
                      <Field
                        type="string"
                        name="lastName"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Address</h2>
                      <ErrorMessage name="addressLine" component="div" />
                      <Field
                        type="string"
                        name="addressLine"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Country Code</h2>
                      <ErrorMessage name="countryCode" component="div" />
                      <Field
                        type="string"
                        name="countryCode"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Postal Code</h2>
                      <ErrorMessage name="postalCode" component="div" />
                      <Field
                        type="string"
                        name="postalCode"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>City</h2>
                      <ErrorMessage name="city" component="div" />
                      <Field type="string" name="city" className={css.field} />
                    </label>

                    <label>
                      <h2 className={css.label}>Email</h2>
                      <ErrorMessage name="emailAddress" component="div" />
                      <Field
                        type="email"
                        name="emailAddress"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Message (optional)</h2>
                      <ErrorMessage name="message" component="div" />
                      <Field
                        component="textarea"
                        name="message"
                        className={css.field}
                      />
                    </label>

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

export default Home;
