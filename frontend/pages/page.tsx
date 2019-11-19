import React, { useState } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import * as R from 'ramda';

import PaymentIcons from '../components/PaymentIcons';

import CurrentPrice from '../queries/CurrentPrice.gql';
import LoginAsGuest from '../queries/LoginAsGuest.gql';
import AddCartProductAttachment from '../queries/AddCartProductAttachment.gql';
import UpdateCart from '../queries/UpdateCart.gql';
import PaintNumber from '../components/PaintNumber';

import css from './main.css';

const isDev = process.env.NODE_ENV !== 'production';

const Page = () => {
  const [file, setFile] = useState();
  const client = useApolloClient();
  const { data, loading } = useQuery(CurrentPrice, { pollInterval: 60000 });

  const pagePrice = R.pathOr(
    0,
    ['page', 'simulatedPrice', 'price', 'amount'],
    data
  );

  const pagesSold = R.pathOr(0, ['pagesSold'], data);
  const pageProductId = R.path(['page', '_id'], data);

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
      confirm: false
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
        value => value === true
      )
    }),
    onSubmit: async (values, { setSubmitting }) => {
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
    }
  });

  const touchedErrors = Object.keys(formik.touched).filter(
    key => formik.errors[key]
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
          <div className={css.pageOffer}>
            <div className={css.pageOfferLead}>
              <img src="/static/limited-time-offer.png" />
            </div>
            <div className={css.pageOfferText}>
              Buy a whole page in our upcoming book by edition patrick frey and
              put in whatever you want :D
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
                <br />© for the upcoming book by Veli&amp;Amos This is not a
                commercial (Spring 2020): Edition Patrick Frey
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

export default Page;
