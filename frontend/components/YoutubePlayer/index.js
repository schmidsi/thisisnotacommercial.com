// From https://howchoo.com/g/nwywodhkndm/how-to-turn-an-object-into-query-string-parameters-in-javascript
const queryString = params =>
  Object.keys(params)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    })
    .join('&');

const YoutubePlayer = ({
  height = 500,
  width = 500,
  id = 'gz0jm5ULfdo',
  controls = false,
  autoplay = true,
  loop = true,
  modestbranding = true
}) => {
  const params = {
    version: 3,
    playlist: id,
    controls: controls ? 1 : 0,
    autoplay: autoplay ? 1 : 0,
    loop: loop ? 1 : 0,
    modestbranding: modestbranding ? 1 : 0
  };
  const baseUrl = 'https://www.youtube-nocookie.com/embed/';
  const src = `${baseUrl}${id}?${queryString(params)}`;

  return (
    <iframe
      width={width}
      height={height}
      src={src}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
};

export default YoutubePlayer;
