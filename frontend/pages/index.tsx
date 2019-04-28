import React from "react";
import { Query, ApolloConsumer } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import * as R from "ramda";

import CurrentPrice from "../queries/CurrentPrice.gql";
import LoginAsGuest from "../queries/LoginAsGuest.gql";
import AddCartProduct from "../queries/AddCartProduct.gql";

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
                  name: "asdf",
                  address: "asdf",
                  zipCity: "asdf",
                  country: "Switzerland",
                  email: "asdf@asdf.ch",
                  message: ""
                }}
                validationSchema={yup.object().shape({
                  name: yup.string().required(),
                  address: yup.string().required(),
                  zipCity: yup.string().required(),
                  country: yup.string().required(),
                  email: yup
                    .string()
                    .email()
                    .required(),
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

                  setSubmitting(false);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <label>
                      <h2 className={css.label}>Name</h2>
                      <ErrorMessage name="name" component="div" />
                      <Field type="string" name="name" className={css.field} />
                    </label>

                    <label>
                      <h2 className={css.label}>Address</h2>
                      <ErrorMessage name="address" component="div" />
                      <Field
                        type="string"
                        name="address"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>ZIP / City</h2>
                      <ErrorMessage name="zipCity" component="div" />
                      <Field
                        type="string"
                        name="zipCity"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Country</h2>
                      <ErrorMessage name="country" component="div" />
                      <Field
                        type="string"
                        name="country"
                        className={css.field}
                      />
                    </label>

                    <label>
                      <h2 className={css.label}>Email</h2>
                      <ErrorMessage name="email" component="div" />
                      <Field type="email" name="email" className={css.field} />
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
