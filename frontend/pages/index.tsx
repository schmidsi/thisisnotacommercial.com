import React from 'react';
import Router from 'next/router';
import classNames from 'classnames';
import { Query, ApolloConsumer } from 'react-apollo';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import * as R from 'ramda';

import InstagramStream from '../components/InstagramStream';

import CurrentPrice from '../queries/CurrentPrice.gql';
import LoginAsGuest from '../queries/LoginAsGuest.gql';
import AddCartProduct from '../queries/AddCartProduct.gql';
import UpdateCart from '../queries/UpdateCart.gql';
import PaintNumber from '../components/PaintNumber';

import css from './main.css';

const isDev = process.env.NODE_ENV !== 'production';

const Home = () => (
  <Query query={CurrentPrice} pollInterval={60000}>
    {(result: any) => {
      const price = R.pathOr(
        0,
        ['data', 'product', 'simulatedPrice', 'price', 'amount'],
        result
      );

      const soldItems = R.pathOr(0, ['data', 'soldItems'], result);

      const productId = R.path(['data', 'product', '_id'], result);

      return (
        <div className={css.container}>
          <header className={css.header}>
            <div className={css.logoHolder}>
              <img
                src="/static/logo.jpg"
                alt="This is not a commercial logo"
                className={css.logo}
              />
            </div>
            <div className={css.titleHolder}>
              <h1>This is not a commercial</h1>
              <p className={css.subtitle}>Art Project by Veli &amp; Amos</p>
            </div>
          </header>

          {result.loading ? (
            <img src="/static/spinner.gif" />
          ) : (
            <div>
              <div className={css.priceBox}>
                <div>
                  <img src="/static/price-up.png" />
                </div>

                <div className={css.priceText}>
                  No: <br />
                  <span>
                    <PaintNumber>{soldItems + 1}</PaintNumber>
                  </span>
                  <br />
                  Current price: <br />
                  <span>
                    <PaintNumber euro>{price / 100}</PaintNumber>
                  </span>
                  <br />
                </div>
              </div>

              <img
                src="/static/postcard-empty.jpg"
                alt="ORDER - an original painting by Veli &amp; Amos. Guest artists to be announced"
              />

              <ApolloConsumer>
                {client => (
                  <Formik
                    initialValues={{
                      firstName: isDev ? 'Hans' : '',
                      lastName: isDev ? 'Muster' : '',
                      addressLine: isDev ? 'Bahnhofstrasse 1' : '',
                      postalCode: isDev ? '8001' : '',
                      countryCode: 'CH',
                      city: isDev ? 'Zürich' : '',
                      emailAddress: isDev ? 'asdf@asdf.ch' : '',
                      message: isDev ? 'Test Message' : ''
                    }}
                    validationSchema={yup.object().shape({
                      firstName: yup
                        .string()
                        .required('First name is required.'),
                      lastName: yup.string().required('Last name is required.'),
                      addressLine: yup
                        .string()
                        .required('Address is required.'),
                      postalCode: yup
                        .string()
                        .required('Post code is required.'),
                      countryCode: yup
                        .string()
                        .required('Country code is required.'),
                      city: yup.string().required('City is required.'),
                      emailAddress: yup
                        .string()
                        .email('Invalid email address')
                        .required('Please provide an email address'),
                      message: yup.string()
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                      const loginAsGuestResult = await client.mutate({
                        mutation: LoginAsGuest
                      });

                      const token = R.pathOr(
                        '',
                        ['data', 'loginAsGuest', 'token'],
                        loginAsGuestResult
                      );

                      if (window && window.localStorage)
                        window.localStorage.setItem('token', token);

                      await client.mutate({
                        mutation: AddCartProduct,
                        variables: { productId }
                      });

                      await client.mutate({
                        mutation: UpdateCart,
                        variables: {
                          ...values,
                          meta: { message: values.message }
                        }
                      });

                      setSubmitting(false);

                      Router.push({
                        pathname: '/order'
                        // query: { token }
                      });
                    }}
                  >
                    {({ isSubmitting, errors }) => (
                      <Form>
                        <label>
                          <h3 className={css.label}>First Name</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="firstName"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="firstName"
                            placeholder="Hans Ulrich"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Last Name</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="lastName"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="lastName"
                            placeholder="Obrist"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Address</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="addressLine"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="addressLine"
                            placeholder="Kunststrasse 12"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Country Code</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="countryCode"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="countryCode"
                            placeholder="CH"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Postal Code</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="postalCode"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="postalCode"
                            placeholder="8001"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>City</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="city"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="city"
                            placeholder="Zurich"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Email</h3>
                          <ErrorMessage
                            className={css.labelError}
                            name="emailAddress"
                            component="div"
                          />
                          <Field
                            type="email"
                            name="emailAddress"
                            placeholder="hans.ulrich.obrist@example.com"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <h3 className={css.label}>Message (optional)</h3>
                          <ErrorMessage name="message" component="div" />
                          <Field
                            component="textarea"
                            name="message"
                            placeholder="We might add this to the painting."
                            className={css.field}
                          />
                        </label>

                        {Object.keys(errors).length > 0 ? (
                          <div className={css.finalError}>
                            Please fix the errors before proceeding.{' '}
                          </div>
                        ) : (
                          <div />
                        )}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={css.button}
                          style={{ marginBottom: 40 }}
                        >
                          {isSubmitting ? (
                            <img src="/static/spinner.gif" />
                          ) : (
                            <img src="/static/iwantone.png" alt="I want one" />
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>
                )}
              </ApolloConsumer>
            </div>
          )}
          <img
            src="/static/free-shipping.png"
            alt="Free shipping - world wide"
          />
          <img
            className={css.paymentIcons}
            src="/static/bitcoin.png"
            alt="bitcoin"
          />
          <img
            className={css.paymentIcons}
            src="/static/litecoin-ether.png"
            alt="litecoin and ether"
          />
          <img
            className={css.paymentIcons}
            src="/static/paypal_cc.png"
            alt="CC payment methods"
          />

          <a href="mailto:veliandamos@gmail.com">
            <img
              src="/static/mail.png"
              alt="If you have any questions, mail us"
            />
          </a>

          <h2>Gallery</h2>
          <a
            href="https://www.instagram.com/this_is_not_a_commercial/"
            className={css.followUs}
          >
            <img src="/static/instagram.png" />
            <span>Follow us on Instagram: @this_is_not_a_commercial</span>
          </a>
          <InstagramStream />
          <a
            href="https://www.instagram.com/this_is_not_a_commercial/"
            className={css.followUs}
          >
            <img src="/static/instagram.png" />
            <span>Follow us on Instagram: @this_is_not_a_commercial</span>
          </a>
        </div>
      );
    }}
  </Query>
);

export default Home;
