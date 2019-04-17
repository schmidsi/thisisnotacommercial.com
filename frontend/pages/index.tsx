import React from "react";
import { Query } from "react-apollo";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

import query from "../queries/CurrentPrice.gql";
import css from "./index.css";

const Home = () => (
  <div className={css.container}>
    <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
    <h1>This is not a commercial</h1>

    <Query query={query}>
      {(result: any) => {
        const { data } = result;

        return (
          <div>
            Current price: {data.product.simulatedPrice.price.amount / 100}€
          </div>
        );
      }}
    </Query>

    <h1>Order</h1>
    <Formik
      initialValues={{
        name: "",
        address: "",
        zipCity: "",
        country: "Switzerland",
        email: "",
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
      onSubmit={(values, { setSubmitting }) => {
        console.log(values);
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
            <Field type="string" name="address" className={css.field} />
          </label>

          <label>
            <h2 className={css.label}>ZIP / City</h2>
            <ErrorMessage name="zipCity" component="div" />
            <Field type="string" name="zipCity" className={css.field} />
          </label>

          <label>
            <h2 className={css.label}>Country</h2>
            <ErrorMessage name="country" component="div" />
            <Field type="string" name="country" className={css.field} />
          </label>

          <label>
            <h2 className={css.label}>Email</h2>
            <ErrorMessage name="email" component="div" />
            <Field type="email" name="email" className={css.field} />
          </label>

          <label>
            <h2 className={css.label}>Message (optional)</h2>
            <ErrorMessage name="message" component="div" />
            <Field component="textarea" name="message" className={css.field} />
          </label>

          <button type="submit" disabled={isSubmitting} className={css.button}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  </div>
);

export default Home;
