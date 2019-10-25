import React from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { Query, ApolloConsumer } from 'react-apollo';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import * as R from 'ramda';

import PaymentIcons from '../components/PaymentIcons';
import Gallery from '../components/Gallery';

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
              <p className={css.subtitle}>Art by Veli &amp; Amos</p>
            </div>
            <Link href="/page">
              <a className={css.pageOffer}>
                <div className={css.pageOfferLead}>Limited time offer</div>
                <div className={css.pageOfferText}>
                  Buy a whole page in our upcoming book on edition patrick frey
                  and put in whatever you want :D (No dick-pics though).
                </div>
                <div className={css.pageOfferCTA}>
                  Click here to get it now for only €{100}. Price goes up 4%
                  with every sale 🤑😱.
                </div>
              </a>
            </Link>
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
                src="/static/new-postcard-empty.jpg"
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
                          <img
                            className={css.paintedLabel}
                            src="/static/first-name.png"
                            alt="First Name"
                          />
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
                          <img
                            className={css.paintedLabel}
                            src="/static/last-name.png"
                            alt="Last Name"
                          />
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
                          <img
                            className={css.paintedLabel}
                            src="/static/address.png"
                            alt="Address"
                          />
                          <ErrorMessage
                            className={css.labelError}
                            name="addressLine"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="addressLine"
                            placeholder="Engelstrasse 12"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <img
                            className={css.paintedLabel}
                            src="/static/country-code.png"
                            alt="Country Code"
                          />
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
                          <img
                            className={css.paintedLabel}
                            src="/static/postal-code.png"
                            alt="Postal Code"
                          />
                          <ErrorMessage
                            className={css.labelError}
                            name="postalCode"
                            component="div"
                          />
                          <Field
                            type="string"
                            name="postalCode"
                            placeholder="8004"
                            className={css.field}
                          />
                        </label>

                        <label>
                          <img
                            src="/static/city.png"
                            alt="City"
                            className={css.paintedLabel}
                          />
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
                          <img
                            className={css.paintedLabel}
                            src="/static/email.png"
                            alt="Email"
                          />
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
                          <img
                            className={css.paintedLabel}
                            src="/static/message-optional.png"
                            alt="Message (optional)"
                          />
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

          <PaymentIcons />
          <Gallery />
        </div>
      );
    }}
  </Query>
);

export default Home;
