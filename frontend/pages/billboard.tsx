import React, { useState } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useApolloClient } from '@apollo/react-hooks';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as R from 'ramda';

import PaymentIcons from '../components/PaymentIcons';

import LoginAsGuest from '../queries/LoginAsGuest.gql';
import AddCartProductAttachment from '../queries/AddCartProductAttachment.gql';
import UpdateCart from '../queries/UpdateCart.gql';

import css from './main.css';
import PaintNumber from '../components/PaintNumber';
import useProduct from '../hooks/useProduct';

const isDev = process.env.NODE_ENV !== 'production';

const Billboard = () => {
  const router = useRouter();
  const [file, setFile] = useState();
  const client = useApolloClient();

  const isStaging = router?.query?.test !== undefined;
  const { product, soldItems, loading } = useProduct({
    slug: isStaging ? 'testbillboard' : 'billboard',
  });

  const formik = useFormik({
    initialValues: {
      firstName: isDev ? 'Hans' : '',
      lastName: isDev ? 'Muster' : '',
      addressLine: isDev ? 'Bahnhofstrasse 1' : '',
      postalCode: isDev ? '8001' : '',
      countryCode: 'CH',
      city: isDev ? 'Zürich' : '',
      emailAddress: isDev ? 'asdf@asdf.ch' : '',
      attachment: '',
      message: '',
      confirm: false,
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
      attachment: Yup.string().required('You need to provide an image.'),
      confirm: Yup.bool().test(
        'is-true',
        'Must agree to terms to continue',
        (value) => value === true,
      ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const loginAsGuestResult = await client.mutate({
        mutation: LoginAsGuest,
      });

      const token = R.pathOr(
        '',
        ['data', 'loginAsGuest', 'token'],
        loginAsGuestResult,
      );

      if (window && window.localStorage)
        window.localStorage.setItem('token', token);

      await client.mutate({
        mutation: AddCartProductAttachment,
        variables: {
          productId: product._id,
          attachment: file,
        },
      });

      await client.mutate({
        mutation: UpdateCart,
        variables: {
          ...values,
        },
      });

      setSubmitting(false);

      Router.push({
        pathname: '/order',
        // query: { token }
      });
    },
  });

  const touchedErrors = Object.keys(formik.touched).filter(
    (key) => formik.errors[key],
  );

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

      {loading ? (
        <img src="/static/spinner.gif" />
      ) : (
        <div>
          <img
            src="/static/billboard.png"
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
                <PaintNumber>{soldItems + 1}</PaintNumber>
              </span>
              <br />
              Current price (CHF): <br />
              <span>
                <PaintNumber>
                  {product?.simulatedPrice?.price?.amount / 100}
                </PaintNumber>
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
                <div className={css.labelError}>{formik.errors.firstName}</div>
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
                <div className={css.labelError}>{formik.errors.postalCode}</div>
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
                placeholder="I love Veli & Amos"
              />
            </label>

            <label>
              <img
                className={css.paintedLabel}
                src="/static/upload-image.png"
                alt="Image"
              />
              <div className={css.field}>
                <b>Dimensions:</b> Billboard will be painted:
                <br />
                6 × 2 meter
                <br />
                <b>File format: </b>pdf, jpg, tif, png
                <input
                  type="file"
                  onChange={(e: any) => {
                    formik.setFieldValue('attachment', e.target.files[0]);
                    setFile(e.target.files[0]);
                  }}
                />
                {formik.touched.attachment && formik.errors.attachment ? (
                  <div className={css.labelError}>
                    {formik.errors.attachment}
                  </div>
                ) : null}
                <img src={file && URL.createObjectURL(file)} />
              </div>
            </label>

            <label className={css.field} style={{ marginTop: 20 }}>
              <p>
                <input
                  className={css.confirm}
                  {...formik.getFieldProps('confirm')}
                  style={{ fontSize: 20 }}
                  type="checkbox"
                />
                I hereby confirm that I have the rights for the uploaded image
                to be published
              </p>
              {formik.touched.confirm && formik.errors.confirm ? (
                <div className={css.labelError}>{formik.errors.confirm}</div>
              ) : null}
              <p className={css.small}>
                The author(s) affirm that he/she/they is/are solely entitled to
                dispose of the copyright in the uploaded work or has/have
                obtained the corresponding rights. This does not include the
                graphics and illustrations, for the reprinting of which the
                author shall endeavor to obtain authorization to the best of
                his/her knowledge and belief and as far as possible. The Author
                hereby grants the Publisher for the legal term of copyright the
                sole and exclusive rights to publish, reproduce and distribute
                his/her work.
                <br />
                <br />
                © for the uploaded works: the author(s)
                <br />© for the Billboard: Veli&amp;Amos
              </p>
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

      <PaymentIcons />
    </div>
  );
};

export default Billboard;
