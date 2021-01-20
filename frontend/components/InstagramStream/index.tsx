import React, { useState, useEffect } from 'react';
import getConfig from 'next/config';

import css from './style.css';

interface Post {
  link: string;
  caption: string;
  image: string;
}

const {
  publicRuntimeConfig: { INSTAGRAM_ACCESS_TOKEN },
} = getConfig();

const InstagramStream = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,username,caption&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      );
      const json = await response.json(); // { data: []} //
      const newPosts = json.data?.map((post) => ({
        link: post.permalink,
        image: post?.media_url,
        caption: post?.caption,
      }));

      setPosts(newPosts);
    })();
  }, []);

  return (
    <div className={css.InstagramStream}>
      {posts &&
        posts.map((post) => (
          <a
            key={post.link}
            href={post.link}
            target="_blank"
            className={css.post}
          >
            <img src={post.image} className={css.image} />
            <div className={css.caption}>{post.caption}</div>
          </a>
        ))}
    </div>
  );
};

export default InstagramStream;
