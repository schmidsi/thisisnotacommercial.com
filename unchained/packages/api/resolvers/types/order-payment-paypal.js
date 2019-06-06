import { Orders } from 'meteor/unchained:core-orders';
import { PaypalConfigurationError } from '../../errors';

export default {
  status(obj) {
    return obj.normalizedStatus();
  },
  clientToken(obj) {
    const order = Orders.findOne({ _id: obj.orderId });

    try {
      return obj.provider().run('clientToken', order);
    } catch (error) {
      throw new PaypalConfigurationError({ error });
    }
  },
  meta(obj) {
    return obj.transformedContextValue('meta');
  }
};
