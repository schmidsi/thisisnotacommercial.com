import React, { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import * as Sentry from '@sentry/browser';

import { useApolloClient } from '@apollo/react-hooks';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as R from 'ramda';

import PaymentIcons from '../components/PaymentIcons';
import Gallery from '../components/Gallery';

import LoginAsGuest from '../queries/LoginAsGuest.gql';
import AddCartProduct from '../queries/AddCartProduct.gql';
import UpdateCart from '../queries/UpdateCart.gql';
import PaintNumber from '../components/PaintNumber';

import css from './main.css';
import Popup from '../components/Popup';
import useCurrentPrice from '../hooks/useCurrentPrice';

const isDev = process.env.NODE_ENV !== 'production';

const Home = () => {
  // const [initial, setInitial] = useState(true);
  // const [popupShown, showPopup] = useState(false);
  // const [renderPopup, setRenderPopup] = useState(true);

  // useEffect(() => {
  //   if (process.browser) {
  //     setTimeout(() => showPopup(true), 1000);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!popupShown && initial) {
  //     setInitial(false);
  //     return;
  //   }

  //   if (!popupShown && process.browser) {
  //     setTimeout(() => setRenderPopup(false), 1000);
  //   }
  // }, [popupShown]);

  // const escFunction = useCallback(event => {
  //   if (event.keyCode === 27) {
  //     showPopup(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (process.browser) {
  //     document.addEventListener('keydown', escFunction, false);

  //     return () => {
  //       document.removeEventListener('keydown', escFunction, false);
  //     };
  //   }
  // }, []);

  const client = useApolloClient();

  const {
    data: {
      postcardPrice,
      pagePrice,
      lastPageUrl,
      postcardsSold,
      pagesSold,
      postcardProductId,
    },
    loading,
  } = useCurrentPrice();

  const formik = useFormik({
    initialValues: {
      firstName: isDev ? 'Hans' : '',
      lastName: isDev ? 'Muster' : '',
      addressLine: isDev ? 'Bahnhofstrasse 1' : '',
      postalCode: isDev ? '8001' : '',
      countryCode: 'CH',
      city: isDev ? 'Zürich' : '',
      emailAddress: isDev ? 'asdf@asdf.ch' : '',
      message: isDev ? 'Test Message' : '',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('First name is required.'),
      lastName: Yup.string().required('Last name is required.'),
      addressLine: Yup.string().required('Address is required.'),
      postalCode: Yup.string().required('Post code is required.'),
      countryCode: Yup.string().required('Country code is required.'),
      city: Yup.string().required('City is required.'),
      emailAddress: Yup.string()
        .email('Invalid email address')
        .required('Please provide an email address'),
      message: Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const loginAsGuestResult = await client.mutate({
        mutation: LoginAsGuest,
      });

      const token = R.pathOr(
        '',
        ['data', 'loginAsGuest', 'token'],
        loginAsGuestResult
      );

      if (window && window.localStorage)
        window.localStorage.setItem('token', token);

      const addCartResult = await client.mutate({
        mutation: AddCartProduct,
        variables: { productId: postcardProductId },
      });

      if (addCartResult.errors) Sentry.captureException(addCartResult.errors);

      const updateCartResult = await client.mutate({
        mutation: UpdateCart,
        variables: {
          ...values,
          meta: { message: values.message },
        },
      });

      if (updateCartResult.errors)
        Sentry.captureException(updateCartResult.errors);

      setSubmitting(false);

      Router.push({
        pathname: '/order',
        // query: { token }
      });
    },
  });

  const touchedErrors = Object.keys(formik.touched).filter(
    (key) => formik.errors[key]
  );

  return (
    <>
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
        </header>
      </div>

      {/* {renderPopup && (
        <Popup
          {...{ popupShown, pagePrice, pagesSold, lastPageUrl }}
          close={event => {
            event.preventDefault();
            showPopup(!popupShown);
          }}
        />
      )} */}

      <div className={css.container}>
        {loading ? (
          <img src="/static/spinner.gif" />
        ) : (
          <div>
            <img
              src="/static/new-postcard-empty.jpg"
              alt="ORDER - an original painting by Veli &amp; Amos. Guest artists to be announced"
              style={{ marginBottom: 20 }}
            />

            <div className={css.priceBox}>
              <div>
                <img src="/static/price-up.png" />
              </div>

              <div className={css.priceText}>
                No: <br />
                <span>
                  <PaintNumber>{postcardsSold + 1}</PaintNumber>
                </span>
                <br />
                Current price: <br />
                <span>
                  <PaintNumber euro>{postcardPrice / 100}</PaintNumber>
                </span>
                <br />
              </div>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/first-name.png"
                  alt="First Name"
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className={css.labelError}>
                    {formik.errors.firstName}
                  </div>
                ) : null}
                <input
                  {...formik.getFieldProps('firstName')}
                  className={css.field}
                  placeholder="Hans Ulrich"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/last-name.png"
                  alt="Last Name"
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className={css.labelError}>{formik.errors.lastName}</div>
                ) : null}
                <input
                  {...formik.getFieldProps('lastName')}
                  className={css.field}
                  placeholder="Obrist"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/address.png"
                  alt="Address"
                />
                {formik.touched.addressLine && formik.errors.addressLine ? (
                  <div className={css.labelError}>
                    {formik.errors.addressLine}
                  </div>
                ) : null}
                <input
                  {...formik.getFieldProps('addressLine')}
                  className={css.field}
                  placeholder="Engelstrasse 12"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/country-code.png"
                  alt="Country Code"
                />
                {formik.touched.countryCode && formik.errors.countryCode ? (
                  <div className={css.labelError}>
                    {formik.errors.countryCode}
                  </div>
                ) : null}
                <input
                  {...formik.getFieldProps('countryCode')}
                  className={css.field}
                  placeholder="CH"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/postal-code.png"
                  alt="Postal Code"
                />
                {formik.touched.postalCode && formik.errors.postalCode ? (
                  <div className={css.labelError}>
                    {formik.errors.postalCode}
                  </div>
                ) : null}
                <input
                  {...formik.getFieldProps('postalCode')}
                  className={css.field}
                  placeholder="8004"
                />
              </label>

              <label>
                <img
                  src="/static/city.png"
                  alt="City"
                  className={css.paintedLabel}
                />
                {formik.touched.city && formik.errors.city ? (
                  <div className={css.labelError}>{formik.errors.city}</div>
                ) : null}
                <input
                  {...formik.getFieldProps('city')}
                  className={css.field}
                  placeholder="Zurich"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/email.png"
                  alt="Email"
                />
                {formik.touched.emailAddress && formik.errors.emailAddress ? (
                  <div className={css.labelError}>
                    {formik.errors.emailAddress}
                  </div>
                ) : null}
                <input
                  {...formik.getFieldProps('emailAddress')}
                  className={css.field}
                  placeholder="hans.ulrich.obrist@example.com"
                />
              </label>

              <label>
                <img
                  className={css.paintedLabel}
                  src="/static/message-optional.png"
                  alt="Message (optional)"
                />
                {formik.touched.message && formik.errors.message ? (
                  <div className={css.labelError}>{formik.errors.message}</div>
                ) : null}
                <textarea
                  {...formik.getFieldProps('message')}
                  className={css.field}
                  placeholder="hans.ulrich.obrist@example.com"
                />
              </label>

              {Object.keys(touchedErrors).length > 0 ? (
                <div className={css.finalError}>
                  Please fix the errors before proceeding.{' '}
                </div>
              ) : (
                <div />
              )}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className={css.button}
                style={{ marginBottom: 40 }}
              >
                {formik.isSubmitting ? (
                  <img src="/static/spinner.gif" />
                ) : (
                  <img src="/static/iwantone.png" alt="I want one" />
                )}
              </button>
            </form>
          </div>
        )}
        <img src="/static/free-shipping.png" alt="Free shipping - world wide" />
        <PaymentIcons />
        <Gallery />
      </div>
    </>
  );
};

export default Home;
