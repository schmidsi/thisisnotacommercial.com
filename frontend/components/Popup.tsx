import Link from 'next/link';
import PaintNumber from './PaintNumber';

const Popup = ({ close, popupShown, pagesSold, pagePrice, lastPageUrl }) => (
  <>
    <div className="holder" onClick={close} data-open={popupShown}>
      <Link href="/page">
        <a className="">
          <img src="/static/popup.jpeg" />
          <button onClick={close} />
          <div className="price">
            No: <br />
            <span>
              <PaintNumber>{pagesSold + 1}</PaintNumber>
            </span>
            Current price: <br />
            <span>
              <PaintNumber euro>{pagePrice / 100}</PaintNumber>
            </span>
          </div>
          <div className="lastPage" />
        </a>
      </Link>

      <style jsx>{`
        .lastPage {
          position: absolute;
          right: 6%;
          top: 21%;
          width: 44%;
          height: 48%;

          background-image: url(${lastPageUrl});
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
          background-color: white;
        }

        .price {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-weight: bold;
        }

        .price span {
          font-size: 30px;
        }

        @media only screen and (max-width: 480px) {
          .price span {
            font-size: 20px;
          }
        }

        button {
          position: absolute;
          top: 0;
          right: 0;
          width: 30px;
          height: 30px;
          border: none;
          background-color: transparent;
          cursor: pointer;
        }

        .holder {
          display: flex;
          position: fixed;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          transition: all 0.5s cubic-bezier(0.17, 0.67, 0.59, 1.26);
        }

        img {
          max-height: 90vh;
        }

        .holder[data-open='false'] {
          transform: scale(0);
        }

        .holder[data-open='true'] {
          transform: scale(1);
        }

        a {
          position: relative;
        }
      `}</style>
    </div>
  </>
);

export default Popup;
