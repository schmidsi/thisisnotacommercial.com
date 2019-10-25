import App, { Container } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import Router from 'next/router';
import * as Sentry from '@sentry/browser';

import * as gtag from '../lib/gtag';
import withApolloClient from '../lib/withApolloClient';

import css from './main.css';

Sentry.init({
  dsn: 'https://7ff1270109f14669bfe2edbec0529457@sentry.io/1477328'
});

Router.events.on('routeChangeComplete', url => gtag.pageview(url));

class MyApp extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <>
        <Head>
          <title>Postcard by Veli &amp; Amos: Hand-painted art piece</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${
              gtag.GA_TRACKING_ID
            }`}
          />
          <link rel="stylesheet" href="/static/coinbase-commerce-button.css" />
          <link
            key="apple-touch-icon-57x57"
            rel="apple-touch-icon"
            sizes="57x57"
            href="/static/favicon/apple-icon-57x57.png"
          />
          <link
            key="apple-touch-icon-60x60"
            rel="apple-touch-icon"
            sizes="60x60"
            href="/static/favicon/apple-icon-60x60.png"
          />
          <link
            key="apple-touch-icon-72x72"
            rel="apple-touch-icon"
            sizes="72x72"
            href="/static/favicon/apple-icon-72x72.png"
          />
          <link
            key="apple-touch-icon-76x76"
            rel="apple-touch-icon"
            sizes="76x76"
            href="/static/favicon/apple-icon-76x76.png"
          />
          <link
            key="apple-touch-icon-114x114"
            rel="apple-touch-icon"
            sizes="114x114"
            href="/static/favicon/apple-icon-114x114.png"
          />
          <link
            key="apple-touch-icon-120x120"
            rel="apple-touch-icon"
            sizes="120x120"
            href="/static/favicon/apple-icon-120x120.png"
          />
          <link
            key="apple-touch-icon-144x144"
            rel="apple-touch-icon"
            sizes="144x144"
            href="/static/favicon/apple-icon-144x144.png"
          />
          <link
            key="apple-touch-icon-152x152"
            rel="apple-touch-icon"
            sizes="152x152"
            href="/static/favicon/apple-icon-152x152.png"
          />
          <link
            key="apple-touch-icon-180x180"
            rel="apple-touch-icon"
            sizes="180x180"
            href="/static/favicon/apple-icon-180x180.png"
          />
          <link
            key="icon-192x192"
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/static/favicon/android-icon-192x192.png"
          />
          <link
            key="icon-32x32"
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicon/favicon-32x32.png"
          />
          <link
            key="icon-96x96"
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/static/favicon/favicon-96x96.png"
          />
          <link
            key="icon-16x16"
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicon/favicon-16x16.png"
          />
          <link
            key="manifest"
            rel="manifest"
            href="/static/favicon/manifest.json"
          />
          <meta
            key="msapplication-TileColor"
            name="msapplication-TileColor"
            content="#ffffff"
          />
          <meta
            key="msapplication-TileImage"
            name="msapplication-TileImage"
            content="/static/favicon/ms-icon-144x144.png"
          />
          <meta key="theme-color" name="theme-color" content="#ffffff" />
        </Head>
        <Container>
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
            <a
              href="https://unchained.shop"
              target="_blank"
              className={css.unchained}
            >
              <img
                src="/static/powered-by-unchained.svg"
                alt="Powered by unchained.shop"
              />
            </a>
          </ApolloProvider>
        </Container>
      </>
    );
  }
}

export default withApolloClient(MyApp);
