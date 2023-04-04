import React, { useContext } from "react";
import { PactContext } from "../../../wallet/pact-wallet";
import SideMenuButton from "./side-menu-button";
import { GameContext } from "../game-context";
import { SCREENS } from "../consts";
const TESTING_ADDRESSES = [
  "k:f7278eeaa55a4b52c281fa694035f82a43a6711eb547fc1ab900be1ccf9fb409",
  "k:22ce975d3132bfd480191b1827904c7914faa3e9a6a230b3c8e3ac947f2df560",
  "k:59c26562a516a365428d557fcad29f8b27a22e670152fa4abc04d95265d75ec4",
  "k:ad0be6bb7db1f3c7f34fc25312abefb6f782940c71639a411a7698d43cc71754",
  "k:05f9c7653b28e82f294afa1ab9d272b380f53e68e50d3c5b978327a0c43a7b31",
  "k:9b539e93c8557532bb5ac73f6f5e2dbbf51b3e7dca45c5bb1e71343280050a36",
  "k:731fddc64e047a010ac65f4e7d338d92bc804789110c64c4097181911f3d875b",
  "k:1603d4c5884014fa47a024f99ef322fa48335b9c3ba5b85e709fa9fbe73bdd49",
  "k:cdaa0f2d434bc3e30080fb8f2eba1f395b691cb47dbf078c167372f627441553",
  "k:b9f796d2a4606d808f418e694d48d895c721d2893aab491dd953d5631a1fa530",
  "k:7c98a4d80453e3a0fcfb6f7417dc24723010b5825718489fad8cec7cc6ff7b15",
  "k:1e62c85e3dc0d47fb5c2d7f016e39d0a55763f4ef76eecf5222ead304d5238d2",
  "k:4c65e9b761ae74dd68baa0cf652f61222292a08f1c505d6fd092867b6572f8f9",
  "k:ee1a1f5cc9cdc195ec77586df2414a01ee3941e40d42c70734b4f38f898ca703",
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
      <SideMenuButton
        title="Gen 1 Kitties"
        active={currScreen === SCREENS.GEN_1_KITTIES}
        onClick={() => setCurrScreen(SCREENS.GEN_1_KITTIES)}
      />
      {TESTING_ADDRESSES.includes(account?.account) && (
        <SideMenuButton
          title="Breed"
          active={currScreen === SCREENS.BREED}
          // onClick={() => breed("1:3402", "1:5884")}
          onClick={() => setCurrScreen(SCREENS.BREED)}
        />
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
