import { log } from 'meteor/unchained:core-logger';
import { Orders, OrderPositions } from 'meteor/unchained:core-orders';
import { Products } from 'meteor/unchained:core-products';

export default function() {
  const product = Products.findOne({ slugs: 'page' });

  const confirmedOrderIds = Orders.find({
    confirmed: { $exists: true }
  }).map(order => order._id);

  const lastOrderPosition = OrderPositions.findOne(
    {
      orderId: { $in: confirmedOrderIds },
      productId: product._id
    },
    { sort: { created: -1 } }
  );

  const lastOrder = Orders.findOne({ _id: lastOrderPosition.orderId });

  const orderDocument = lastOrder.document();

  log(`query lastPageUrl ${orderDocument._id}: ${orderDocument.link()}`);
  return orderDocument.link();
}
