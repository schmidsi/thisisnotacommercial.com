import { Query } from "react-apollo";

import CurrentOrder from "../queries/CurrentOrder.gql";

import css from "./main.css";

const ThankYou = () => (
  <Query query={CurrentOrder}>
    {result => (
      <div className={css.container} key="main">
        <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
        <h1>Thank you</h1>
      </div>
    )}
  </Query>
);

export default ThankYou;
