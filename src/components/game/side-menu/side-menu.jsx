import React, { useContext } from "react";
import { PactContext } from "../../../wallet/pact-wallet";
import SideMenuButton from "./side-menu-button";
import { GameContext } from "../game-context";
import { SCREENS } from "../consts";
export default function SideMenu(props) {
  const { openConnectWallet, account } = useContext(PactContext);
  const { setCurrScreen, currScreen } = useContext(GameContext);
  return (
    <div style={menuStyle}>
      <button className="btn btn-custom btn-lg" onClick={openConnectWallet}>
        {account?.account == null ? "Connect wallet" : "Change wallet"}
      </button>
      <SideMenuButton
        title="Buy"
        active={currScreen === SCREENS.BUY}
        onClick={() => setCurrScreen(SCREENS.BUY)}
      />
      <SideMenuButton
        title="My Kitties"
        active={currScreen === SCREENS.MY_KITTIES}
        onClick={() => setCurrScreen(SCREENS.MY_KITTIES)}
      />
      <SideMenuButton
        title="All Kitties"
        active={currScreen === SCREENS.ALL_KITTIES}
        onClick={() => setCurrScreen(SCREENS.ALL_KITTIES)}
      />
    </div>
  );
}

const menuStyle = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-evenly",
};
