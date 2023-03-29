import React, { useContext } from "react";
import { PactContext } from "../../../wallet/pact-wallet";
import SideMenuButton from "./side-menu-button";
import { GameContext } from "../game-context";
import { SCREENS } from "../consts";
const TESTING_ADDRESSES = [
  "k:22ce975d3132bfd480191b1827904c7914faa3e9a6a230b3c8e3ac947f2df560",
  "k:59c26562a516a365428d557fcad29f8b27a22e670152fa4abc04d95265d75ec4",
  "k:ad0be6bb7db1f3c7f34fc25312abefb6f782940c71639a411a7698d43cc71754",
  "k:05f9c7653b28e82f294afa1ab9d272b380f53e68e50d3c5b978327a0c43a7b31",
  "k:9b539e93c8557532bb5ac73f6f5e2dbbf51b3e7dca45c5bb1e71343280050a36",
  "k:731fddc64e047a010ac65f4e7d338d92bc804789110c64c4097181911f3d875b",
  "k:f7278eeaa55a4b52c281fa694035f82a43a6711eb547fc1ab900be1ccf9fb409",
];
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
        title="Gen 0 Kitties"
        active={currScreen === SCREENS.ALL_KITTIES}
        onClick={() => setCurrScreen(SCREENS.ALL_KITTIES)}
      />
      {false && TESTING_ADDRESSES.includes(account?.account) && (
        <>
          <SideMenuButton
            title="Gen 1 Kitties"
            active={currScreen === SCREENS.GEN_1_KITTIES}
            onClick={() => setCurrScreen(SCREENS.GEN_1_KITTIES)}
          />
          <SideMenuButton
            title="Breed"
            active={currScreen === SCREENS.BREED}
            // onClick={() => breed("1:3402", "1:5884")}
            onClick={() => setCurrScreen(SCREENS.BREED)}
          />
        </>
      )}
    </div>
  );
}

const menuStyle = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-evenly",
};
