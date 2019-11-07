import { log } from 'meteor/unchained:core-logger';
import { Products } from 'meteor/unchained:core-products';
import {
  OrderDocuments,
  OrderDocumentTypes
} from 'meteor/unchained:core-orders';

import { ProductNotFoundError } from '../../errors';
import getCart from '../../getCart';

export default async function(
  root,
  { orderId, productId, quantity, attachment },
  { user, userId, countryContext }
) {
  log(`mutation addCartProductAttachment ${productId} ${quantity}`, {
    userId,
    orderId
  });

  const product = Products.findOne({ _id: productId });
  if (!product) throw new ProductNotFoundError({ data: { productId } });

  const cart = getCart({ orderId, user, countryContext });

  Promise.await(
    OrderDocuments.insertWithRemoteFile({
      file: attachment,
      userId,
      meta: {
        orderId: cart._id,
        type: OrderDocumentTypes.OTHER
      }
    })
  );

  return cart.addProductItem({
    product,
    quantity
  });
}
