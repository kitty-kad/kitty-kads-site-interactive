import { useEffect, useState } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import shuffleSeed from "shuffle-seed";

const TOTAL_IMAGES = 33;
const indexes = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
const shuffledIndexes = shuffleSeed.shuffle(indexes, Math.random());

export default function MobileScreen(props) {
  const [imgIndex, setImageIndex] = useState(0);
  const isSmallScreen = useWindowSize() <= 600;
  const screenStyleToAdd = isSmallScreen ? smallScreenStyle : {};
  const screenStyle = { ...style, ...screenStyleToAdd };
  const splitStyleToAddImg = isSmallScreen ? smallImageStyle : {};
  const splitStyleImg = { ...splitContainerStyle, ...splitStyleToAddImg };
  useEffect(() => {
    // Preload the images
    shuffledIndexes.forEach((preloadIndex) => {
      const img = new Image();
      img.src = `/img/${shuffledIndexes[preloadIndex]}.png`;
    });
    let index = 0;
    setInterval(function () {
      index = (index + 1) % shuffledIndexes.length;
      setImageIndex(index);
    }, 4000);
  }, [setImageIndex]);

  const splitStyleToAddTxt = isSmallScreen ? smallTextStyle : normalTextStyle;
  const splitStyleText = { ...splitContainerStyle, ...splitStyleToAddTxt };
  const imgSrc = `/img/${shuffledIndexes[imgIndex]}.png`;
  return (
    <div className="intro" style={screenStyle}>
      <div style={splitStyleImg}>
        <img src={imgSrc} key={imgSrc} style={{ height: 320 }} />
      </div>
      <div style={splitStyleText}>
        <div className="">
          <div className="intro-text">
            <h1>Kitty Kads</h1>
            <p style={{ marginTop: 25 }}>
              Cute NFT Kitties
              <br />
              Breed, trade, collect and play
              <br />
              <br />
              <span>Currently only on Desktop</span>
            </p>
            <div style={{ marginBottom: 20 }}>
              <a href="#socials" className="btn btn-custom btn-lg page-scroll">
                Follow for updates
              </a>
            </div>
            <div>
              <a href="#about" className="btn btn-custom btn-lg page-scroll">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const backgroundColor = "#58B2EE";
const style = {
  background: backgroundColor,
  display: "flex",
  direction: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  maxWidth: "100%",
  overflow: "auto",
  paddingLeft: "20px",
  paddingRight: "20px",
};

const smallScreenStyle = {
  justifyContent: "center",
  paddingBottom: "30px",
  paddingTop: "30px",
};

const splitContainerStyle = {
  width: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
  paddingTop: "70px",
  paddingBottom: "75px",
};

const normalTextStyle = {
  justifyContent: "flex-start",
};

const smallImageStyle = {
  width: "100%",
  paddingTop: "0px",
  paddingBottom: "0px",
  overflow: "hidden",
};

const smallTextStyle = {
  width: "100%",
  paddingTop: 0,
  paddingBottom: "30px",
};
