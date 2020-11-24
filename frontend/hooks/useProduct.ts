import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import * as Sentry from '@sentry/browser';

const ProductQuery = gql`
  query Product($slug: String!) {
    soldItems(slug: $slug)
    product(slug: $slug) {
      _id
      texts {
        _id
        title
        slug
      }
      ... on SimpleProduct {
        simulatedPrice {
          price {
            amount
            currency
          }
        }
        catalogPrice {
          price {
            amount
            currency
          }
        }
      }
    }
  }
`;

const useProduct = ({ slug }) => {
  const { loading, error, data } = useQuery(ProductQuery, {
    pollInterval: 60000,
    variables: { slug }
  });

  if (error) Sentry.captureException(error);

  const product = data?.product;
  const soldItems = data?.soldItems;

  return {
    loading,
    error,
    product,
    soldItems,
  };
};

export default useProduct;
