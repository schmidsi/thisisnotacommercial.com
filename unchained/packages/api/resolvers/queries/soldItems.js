import { log } from 'meteor/unchained:core-logger';
import { Orders, OrderPositions } from 'meteor/unchained:core-orders';
import { Products } from 'meteor/unchained:core-products';

export default function(_, { slug }) {
  const product = Products.findOne({ slugs: slug });

  const confirmedOrderIds = Orders.find({
    confirmed: { $exists: true }
  }).map(order => order._id);

  const confirmedPositions = OrderPositions.find({
    orderId: { $in: confirmedOrderIds },
    productId: product._id
  }).count();

  log(`query soldItems ${slug}: ${confirmedPositions}`);
  return confirmedPositions;
}
