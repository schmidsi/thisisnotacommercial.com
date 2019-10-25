import * as R from "ramda";

const PaintNumber = ({
  children,
  euro = false,
  style = {},
  className = ""
}) => {
  const chars = children.toString().split("");

  return (
    <div style={style} className={"root " + className}>
      {chars.map(char => (
        <div key={char}
          className="img"
          style={{ backgroundImage: `url(/static/chars/${char}.png)` }}
        />
      ))}
      {euro ? (
        <div
          className="img"
          style={{ backgroundImage: `url(/static/chars/eur.png)` }}
        />
      ) : (
        ""
      )}
      <style jsx>{`
        .root {
          white-space: nowrap;
        }

        .img {
          display: inline-block;
          width: 1em;
          height: 1em;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center bottom;
        }
      `}</style>
    </div>
  );
};

export default PaintNumber;
