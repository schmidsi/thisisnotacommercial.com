import { compose, createSink } from 'recompose';
import { withRouter } from 'next/router';
import withCurrentUser from '../lib/withCurrentUser';

export default compose(
  withCurrentUser,
  withRouter
)(
  createSink(({ to, router, ifLoggedIn, currentUser, loading }) => {
    // Only redirect client side: https://github.com/zeit/next.js/blob/master/errors/no-router-instance.md
    if (!router || typeof window === 'undefined') return;

    const realUser = currentUser._id && !currentUser.isGuest;
    if (!ifLoggedIn && !loading && !realUser) {
      console.debug(`user anonymous, redirect to ${to}: checkpoint`); // eslint-disable-line
      router.replace(to);
    }
    if (ifLoggedIn && !loading && realUser) {
      console.debug(`user logged in, redirect to ${to}: checkpoint`); // eslint-disable-line
      router.replace(to);
    }
  })
);
