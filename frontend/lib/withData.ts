import { withData } from 'next-apollo';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import getConfig from 'next/config';

const { publicRuntimeConfig = {} } = getConfig() || {};

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ||
  publicRuntimeConfig.GRAPHQL_ENDPOINT ||
  'http://localhost:4010/graphql';

const httpLink = new HttpLink({
  credentials: 'same-origin',
  uri: GRAPHQL_ENDPOINT
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

const config = {
  link: (process as any).browser ? authLink.concat(httpLink) : httpLink
};

export default withData(config);
