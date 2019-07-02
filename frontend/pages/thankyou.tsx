import { Query } from 'react-apollo';

import ShareButtons from '../components/ShareButtons/index';
import CurrentOrder from '../queries/CurrentOrder.gql';

import css from './main.css';

const ThankYou = () => (
  <Query query={CurrentOrder}>
    {result => (
      <div className={css.container} key="main">
        <img src="/static/titile.jpg" alt="Postcard by Veli &amp; Amos" />
        <h1>Thank you for your order!</h1>
        <ShareButtons />
      </div>
    )}
  </Query>
);

export default ThankYou;
