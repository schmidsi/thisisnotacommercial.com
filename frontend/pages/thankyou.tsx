import ShareButtons from '../components/ShareButtons/index';

import css from './main.css';

const ThankYou = () => {
  return (
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
  );
};
export default ThankYou;
