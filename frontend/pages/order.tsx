import { Query } from "react-apollo";
import * as R from "ramda";

import CurrentOrder from "../queries/CurrentOrder.gql";

import css from "./main.css";

const Order = () => (
  <Query query={CurrentOrder}>
    {(result: any) => {
      const cart = R.pathOr({}, ["data", "me", "cart"], result);
      const order = {
        firstName: R.pathOr("", ["billingAddress", "firstName"], cart),
        lastName: R.pathOr("", ["billingAddress", "lastName"], cart),
        addressLine: R.pathOr("", ["billingAddress", "addressLine"], cart),
        postalCode: R.pathOr("", ["billingAddress", "postalCode"], cart),
        countryCode: R.pathOr("", ["billingAddress", "countryCode"], cart),
        city: R.pathOr("", ["billingAddress", "city"], cart),
        emailAddress: R.pathOr("", ["contact", "emailAddress"], cart),
        message: R.pathOr("", ["meta", "message"], cart),
        total: R.pathOr("", ["total", "amount"], cart)
      };
      console.log(order);

      return (
        <div className={css.container}>
          <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
          <h1>Your order</h1>
          <dl>
            {R.toPairs(order).map(([name, value]) => (
              <>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </>
            ))}
          </dl>
        </div>
      );
    }}
  </Query>
);

export default Order;
