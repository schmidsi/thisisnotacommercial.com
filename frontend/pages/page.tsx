import React, { useState } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { Query, ApolloConsumer } from 'react-apollo';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import * as R from 'ramda';

import PaymentIcons from '../components/PaymentIcons';

import CurrentPrice from '../queries/CurrentPrice.gql';
import LoginAsGuest from '../queries/LoginAsGuest.gql';
import AddCartProductAttachment from '../queries/AddCartProductAttachment.gql';
import UpdateCart from '../queries/UpdateCart.gql';
import PaintNumber from '../components/PaintNumber';

import css from './main.css';

const isDev = process.env.NODE_ENV !== 'production';

const Uploader = ({ setFile }) => {
  const onChange = e => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <input type="file" onChange={onChange} />
    </div>
  );
};

const Home = () => {
  const [file, setFile] = useState();

  file && console.log(URL.createObjectURL(file));

  return (
    <Query query={CurrentPrice} pollInterval={60000}>
      {(result: any) => {
        const { data } = result;

        const pagePrice = R.pathOr(
          0,
          ['page', 'simulatedPrice', 'price', 'amount'],
          data
        );

        const pagesSold = R.pathOr(0, ['pagesSold'], data);
        const pageProductId = R.path(['page', '_id'], data);

        return (
          <div className={css.container}>
            <header className={css.header}>
              <Link href="/">
                <a>
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
                </a>
              </Link>
            </header>

            {result.loading ? (
              <img src="/static/spinner.gif" />
            ) : (
              <div>
                <div className={css.pageOffer}>
                  <div className={css.pageOfferLead}>Limited time offer</div>
                  <div className={css.pageOfferText}>
                    Buy a whole page in our upcoming book on edition patrick
                    frey and put in whatever you want :D
                  </div>
                  <div className={css.pageOfferCTA}>
                    Price goes up 4% with every sale 🤑😱.
                  </div>
                </div>

                <div className={css.priceBox}>
                  No: <br />
                  <span>
                    <PaintNumber>{pagesSold + 1}</PaintNumber>
                  </span>
                  <div className={css.priceText}>
                    <br />
                    Current price: <br />
                    <span>
                      <PaintNumber euro>{pagePrice / 100}</PaintNumber>
                    </span>
                    <br />
                  </div>
                </div>

                <h2 style={{ marginTop: 80 }}>Order your page in our book:</h2>

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
                        confirm: false
                      }}
                      validationSchema={yup.object().shape({
                        firstName: yup
                          .string()
                          .required('First name is required.'),
                        lastName: yup
                          .string()
                          .required('Last name is required.'),
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
                        confirm: yup
                          .bool()
                          .test(
                            'is-true',
                            'Must agree to terms to continue',
                            value => value === true
                          )
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

                        console.log(values);

                        await client.mutate({
                          mutation: AddCartProductAttachment,
                          variables: {
                            productId: pageProductId,
                            attachment: file
                          }
                        });

                        await client.mutate({
                          mutation: UpdateCart,
                          variables: {
                            ...values
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
                              src="/static/upload-image.png"
                              alt="Image"
                            />
                            <div className={css.field}>
                              <b>Format:</b> 1 Fullpage Landscape:
                              <br />
                              260 × 195 mm or
                              <br />
                              3071 × 2303 px
                              <br />
                              <b>Resolution:</b> 300 dpi
                              <br />
                              <b>File format: </b>pdf, jpg, tif, png
                              <Uploader setFile={setFile} />
                              <img src={file && URL.createObjectURL(file)} />
                            </div>
                          </label>

                          <label
                            className={css.field}
                            style={{ marginTop: 20 }}
                          >
                            <p>
                              <Field
                                type="checkbox"
                                name="confirm"
                                style={{ fontSize: 20 }}
                              />
                              I hereby confirm that I have the rights for the
                              uploaded image to be published
                            </p>
                            <ErrorMessage
                              className={css.labelError}
                              name="confirm"
                              component="div"
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
                              <img
                                src="/static/iwantone.png"
                                alt="I want one"
                              />
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
          </div>
        );
      }}
    </Query>
  );
};

export default Home;
