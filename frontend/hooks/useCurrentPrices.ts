import * as R from 'ramda';
import { useQuery } from '@apollo/react-hooks';
import * as Sentry from '@sentry/browser';

import CurrentPrice from '../queries/CurrentPrice.gql';
import { useRouter } from 'next/router';

const useCurrentPrice = () => {
  const router = useRouter();

  const isStaging = router?.query?.test !== undefined;

  const { loading, error, data } = useQuery(CurrentPrice, {
    pollInterval: 60000,
    variables: {
      postcardSlug: isStaging ? 'testpostcard' : 'postcard',
      pageSlug: isStaging ? 'testpage' : 'page'
    }
  });

  if (error) Sentry.captureException(error);

  const postcardPrice = R.pathOr(
    0,
    ['postcard', 'simulatedPrice', 'price', 'amount'],
    data
  );
  const pagePrice = R.pathOr(
    0,
    ['page', 'simulatedPrice', 'price', 'amount'],
    data
  );

  const lastPageUrl = R.pathOr('', ['lastPageUrl'], data);

  const postcardsSold = R.pathOr(0, ['postcardsSold'], data);
  const pagesSold = R.pathOr(0, ['pagesSold'], data);

  const postcardProductId = R.path(['postcard', '_id'], data);
  const pageProductId = R.path(['page', '_id'], data);

  return {
    data: {
      lastPageUrl,
      postcardPrice,
      pagePrice,
      postcardsSold,
      pagesSold,
      postcardProductId,
      pageProductId
    },
    error,
    loading
  };
};

export default useCurrentPrice;
