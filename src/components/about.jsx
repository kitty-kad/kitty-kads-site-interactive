import banner from "./../banner.png";
import useWindowSize from "../hooks/useWindowSize";
export const About = (props) => {
  const isSmallScreen = useWindowSize() <= 600;
  const rowStyle = isSmallScreen ? rowStyleSmallScreen : rowStyleBase;
  const imgStyle = isSmallScreen ? imgStyleSmall : imgStyleBase;

  return (
    <div id="about" className="text-center">
      <div className="container">
        <div className="row" style={rowStyle}>
          <div
            className="col-xs-12 col-md-6"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2>What are Kitty Kads?</h2>
            <p style={{ marginBottom: 0 }}>
              {props.data ? props.data.paragraph : "loading..."}
              <br />
              {props.data ? props.data.paragraph2 : "loading..."}
              <br />
              You can read their origin story{" "}
              <a href="https://medium.com/@kitty.kad.token/kitty-kads-nfts-and-game-c962c8fad768">
                {" "}
                here
              </a>
              <br />
              <br />
              {props.data ? props.data.paragraph3 : "loading..."}
            </p>
          </div>
          <div
            className="col-xs-12 col-md-6"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={banner}
              style={imgStyle}
              className="img-responsive"
              alt=""
            />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

const rowStyleBase = {
  display: "flex",
  // width: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const rowStyleSmallScreen = {
  ...rowStyleBase,
  flexDirection: "column",
};

const imgStyleBase = {
  maxHeight: 250,
  marginTop: 0,
  width: "auto",
  marginLeft: "auto",
  marginRight: "auto",
  display: "block",
};

const imgStyleSmall = {
  ...imgStyleBase,
  marginTop: 25,
};
