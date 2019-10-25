import * as R from 'ramda';
import { useQuery } from '@apollo/react-hooks';

import CurrentPrice from '../queries/CurrentPrice.gql';

const useCurrentPrice = () => {
  const { loading, error, data } = useQuery(CurrentPrice, {
    pollInterval: 60000
  });

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

  const postcardsSold = R.pathOr(0, ['postcardsSold'], data);
  const pagesSold = R.pathOr(0, ['pagesSold'], data);

  const postcardProductId = R.path(['postcard', '_id'], data);
  const pageProductId = R.path(['postcard', '_id'], data);

  return {
    data: {
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
