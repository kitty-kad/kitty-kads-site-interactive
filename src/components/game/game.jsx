import { useContext, useState } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import {
  PactContext,
  // TEST_NET_ID,
  MAIN_NET_ID,
} from "../../wallet/pact-wallet";
import SideMenu from "./side-menu/side-menu";
import ScreenContainer from "./screens/screen-container";
import MobileScreen from "./screens/mobile-screen";

import { GameContextProvider } from "./game-context";

export const Header = (_props) => {
  // const isSmallScreen = useWindowSize() <= 600;
  const { useSetNetworkSettings, networkUrl } = useContext(PactContext);
  const windowSize = useWindowSize();
  useSetNetworkSettings(MAIN_NET_ID, "1");

  return (
    <header id="header">
      {windowSize < 800 && <MobileScreen />}
      {windowSize >= 800 && (
        <GameContextProvider>
          <div className="intro" style={screenStyle}>
            <div style={sideMenuStyle}>
              <SideMenu />
            </div>
            <div style={mainContentStyle}>
              {networkUrl != null && <ScreenContainer />}
            </div>
          </div>
        </GameContextProvider>
      )}
    </header>
  );
};

const backgroundColor = "#58B2EE";
const screenStyle = {
  background: backgroundColor,
  display: "flex",
  direction: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  maxWidth: "100%",
  overflow: "auto",
  paddingLeft: "20px",
  paddingRight: "20px",
};

const sideMenuStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  width: "20%",
};

const mainContentStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  width: "70%",
};

const splitContainerStyle = {
  // width: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
  paddingTop: "140px",
  paddingBottom: "75px",
};
