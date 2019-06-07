import { log } from 'meteor/unchained:core-logger';
import { Orders } from 'meteor/unchained:core-orders';

export default function() {
  const confirmedOrders = Orders.find({
    confirmed: { $exists: true }
  }).count();

  log(`query soldItems`);
  return confirmedOrders;
}
