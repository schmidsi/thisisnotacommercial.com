import { withData } from 'next-apollo';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

const httpLink = new HttpLink({
  credentials: 'same-origin',
  uri: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4010/graphql'
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
