import { Query } from 'react-apollo';

import ShareButtons from '../components/ShareButtons/index';
import CurrentOrder from '../queries/CurrentOrder.gql';

import css from './main.css';

const ThankYou = () => (
  <Query query={CurrentOrder}>
    {result => (
      <div className={css.container} key="main">
        <img
          className={css.center}
          src="/static/thank-you.png"
          alt="Thank you for your order!"
        />
        <img
          src="/static/send-us-a-pic.png"
          alt="Please send us a picture when you get it!"
        />
        <ShareButtons />
      </div>
    )}
  </Query>
);

export default ThankYou;
