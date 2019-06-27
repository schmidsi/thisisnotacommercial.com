import React from 'react';

import InstagramStream from '../InstagramStream';
import css from './style.css';

const Gallery = () => {
  return (
    <div>
      <h2>Gallery</h2>
      <a
        href="https://www.instagram.com/this_is_not_a_commercial/"
        className={css.followUs}
      >
        <img src="/static/instagram.png" />
        <span>Follow us on Instagram: @this_is_not_a_commercial</span>
      </a>
      <InstagramStream />
      <a
        href="https://www.instagram.com/this_is_not_a_commercial/"
        className={css.followUs}
      >
        <img src="/static/instagram.png" />
        <span>Follow us on Instagram: @this_is_not_a_commercial</span>
      </a>
    </div>
  );
};

export default Gallery;
