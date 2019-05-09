import * as R from "ramda";
import React, { useState, useEffect } from "react";

import css from "./style.css";

interface Post {
  link: string;
  caption: string;
  image: string;
}

const InstagramStream = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://api.instagram.com/v1/users/self/media/recent/?access_token=5680860.167ddba.986e0cd55dce4423af86c28c5c72c40a"
      );
      const json = await response.json();
      const newPosts = json.data.map(post => ({
        link: post.link,
        caption: R.path(["caption", "text"], post),
        image: R.path(["images", "standard_resolution", "url"], post)
      }));

      setPosts(newPosts);
    })();
  }, []);

  return (
    <div className={css.InstagramStream}>
      {posts.map(post => (
        <a href={post.link} target="_blank" className={css.post}>
          <img src={post.image} className={css.image} />
          <div className={css.caption}>{post.caption}</div>
        </a>
      ))}
    </div>
  );
};

export default InstagramStream;
