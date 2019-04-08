import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import css from "./index.css";

const Home = () => (
  <Query
    query={gql`
      {
        currentPrice
      }
    `}
  >
    {(result: any) => {
      const { data } = result;

      return (
        <div className={css.container}>
          <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
          <h1>This is not a commercial</h1>
          <div>Current price: {data.currentPrice}€</div>
        </div>
      );
    }}
  </Query>
);

export default Home;
