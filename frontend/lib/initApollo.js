import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject
} from 'apollo-boost';
import { setContext } from 'apollo-link-context';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-unfetch';
import getConfig from 'next/config';
import sentryErrorLink from './sentryErrorLink';
import sentryBreadcrumbsLink from './sentryBreadcrumpsLink';

const { publicRuntimeConfig = {} } = getConfig() || {};

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ||
  publicRuntimeConfig.GRAPHQL_ENDPOINT ||
  process.browser
    ? `http://${document.location.hostname}:4010/graphql`
    : 'http://localhost:4010/graphql';

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

function create(initialState) {
  const httpLink = createUploadLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'same-origin'
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    // TODO: Share GraphQL Auth-token between client and server
    link: process.browser
      ? ApolloLink.from([
          sentryErrorLink,
          sentryBreadcrumbsLink,
          authLink,
          httpLink
        ])
      : ApolloLink.from([sentryErrorLink, sentryBreadcrumbsLink, httpLink]),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
