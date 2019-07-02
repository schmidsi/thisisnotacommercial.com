import React from 'react';
import css from './style.css';

const ShareButtons = () => {
  return (
    <div className={css.center}>
      <link
        href="http://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css"
        rel="stylesheet"
      />
      <h3>Let the world know about us!</h3>
      <div>
        {' '}
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=thisisnotacommerical.com"
          target="_blank"
          className={css.facebook}
        >
          <i className="fa fa-facebook" />
        </a>
        <a
          href="http://twitter.com/share?url=thisisnotacommerciasl.com&text=VeliandAmospostcard"
          target="_blank"
          className={css.twitter}
        >
          <i className="fa fa-twitter" />
        </a>
        <a
          href="http://reddit.com/submit?url=thisisnotacommercial.com&title=CoolProject"
          target="_blank"
          className={css.reddit}
        >
          <i className="fa fa-reddit" />
        </a>
        <a
          href="mailto:?subject=CoolProject&body=Checkthissiteout"
          target="_blank"
          className={css.email}
        >
          <i className="fa fa-envelope" />
        </a>
      </div>
    </div>
  );
};

export default ShareButtons;
