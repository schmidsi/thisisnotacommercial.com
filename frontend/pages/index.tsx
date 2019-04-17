import React from "react";
import { Query } from "react-apollo";
import query from "../queries/CurrentPrice.gql";

import css from "./index.css";

const Home = () => (
  <Query query={query}>
    {(result: any) => {
      const { data } = result;

      console.log(data);

      return (
        <div className={css.container}>
          <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
          <h1>This is not a commercial</h1>
          <div>
            Current price: {data.product.simulatedPrice.price.amount / 100}€
          </div>
        </div>
      );
    }}
  </Query>
);

export default Home;
