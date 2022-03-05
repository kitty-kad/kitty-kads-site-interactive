import React, { useContext, useState, useEffect } from "react";
import { GameContext } from "../game-context";
import { SCREENS } from "../consts";

import {
  useGetMyKitties,
  useGetAllKitties,
  useAdoptKitties,
  useCheckIfOnWl,
  useAmountLeftToAdopt,
  ADMIN_ADDRESS,
} from "../pact-functions";
import { getImagesForIds } from "../server";
import { PactContext } from "../../../wallet/pact-wallet";
export default function ScreenContainer(props) {
  const { currScreen } = useContext(GameContext);
  return (
    <div style={screensStyle}>
      {currScreen == null && <Landing />}
      {currScreen === SCREENS.MY_KITTIES && <MyKitties />}
      {currScreen === SCREENS.ALL_KITTIES && <AllKitties />}
      {currScreen === SCREENS.ADOPT && <AdoptKitties />}
    </div>
  );
}

function Landing() {
  const { account, netId } = useContext(PactContext);
  return (
    <KittyGuideWithContent>
      <div>
        <p>Welcome to the Kitty Kads NFT collection!</p>
        {account?.account == null && <ConnectWalletText />}
        {account?.account != null && (
          <p>Select an option on the left to get started </p>
        )}
      </div>
    </KittyGuideWithContent>
  );
}

function MyKitties() {
  const { account } = useContext(PactContext);
  const getMyKitties = useGetMyKitties();
  const { myKitties, setMyKitties } = useContext(GameContext);
  useEffect(() => {
    if (account?.account == null) {
      return;
    }
    const fetchKitties = async () => {
      const kittyIds = (await getMyKitties()).map((kitty) => kitty.id);
      const images = await getImagesForIds(kittyIds);
      setMyKitties(images);
    };
    fetchKitties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const amount = myKitties?.length ?? 0;

  if (account?.account == null) {
    return (
      <KittyGuideWithContent>
        <div>
          <p>You are signed out</p>
          <ConnectWalletText />
        </div>
      </KittyGuideWithContent>
    );
  }
  return (
    <KittiesList
      kitties={myKitties}
      loading={<Loading text="Looking for your kitties..." />}
      empty={
        <p style={{ textAlign: "center" }}>
          You don't have any kitties yet. <br /> Try adopting one to get started
        </p>
      }
      header={
        myKitties != null && myKitties.length > 0
          ? `You have given ${amount} ${kittiesStr(amount)} a home`
          : null
      }
    />
  );
}

function AdoptKitties() {
  const ADOPT_FOR_ALL = false;
  const [wlResponse, setWlResponse] = useState(null);
  const { account } = useContext(PactContext);
  const hasAccount = account?.account != null;
  const checkWlRole = useCheckIfOnWl();

  useEffect(() => {
    if (account?.account == null) {
      return;
    }
    const fetchKitties = async () => {
      const wlNetworkResponse = await checkWlRole();
      if (wlNetworkResponse === true) {
        setWlResponse(true);
      } else if (wlNetworkResponse === "Only premium WL members allowed") {
        setWlResponse("PREMIUM");
      } else if (
        wlNetworkResponse === "Only secondary and premium WL members allowed"
      ) {
        setWlResponse("SECONDARY");
      }
    };
    fetchKitties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  let content = null;
  if (!ADOPT_FOR_ALL && account?.account !== ADMIN_ADDRESS) {
    content = (
      <>
        <p>
          Adopting is currently not active while prize winners are getting their
          kitties
        </p>
        <p>
          Please follow for updates on Twitter or Discord for when it'll open up
        </p>
      </>
    );
  } else if (!hasAccount) {
    content = (
      <>
        <p>Can't adopt without a wallet!</p>
        <ConnectWalletText />
      </>
    );
  } else if (wlResponse !== true) {
    if (wlResponse === "PREMIUM") {
      content = (
        <>
          <p>Adopting is only enabled for premium WL members for now</p>{" "}
          <p>
            Please follow for updates on Twitter or Discord for when it'll be
            open to more people
          </p>
        </>
      );
    } else if (wlResponse === "SECONDARY") {
      content = (
        <>
          <p>Adopting is only enabled for premium and secondary WL members</p>{" "}
          <p>
            Please follow for updates on Twitter or Discord for when it'll open
            to all people
          </p>
        </>
      );
    } else {
      content = <p>Checking WL status...</p>;
    }
  } else {
    content = <AdoptKittiesInteraction />;
  }
  return (
    <KittyGuideWithContent>
      <div>{content}</div>
    </KittyGuideWithContent>
  );
}

function AdoptKittiesInteraction() {
  const adoptKitties = useAdoptKitties();
  const amountLeftToAdopt = useAmountLeftToAdopt();
  const [amountToAdopt, setAmountToAdopt] = useState(1);
  const { pricePerKitty, setCurrScreen } = useContext(GameContext);

  if (amountLeftToAdopt === 0) {
    return (
      <div>
        <p>The current batch of kitties has been adopted.</p>
        <p>Please check tomorrow for more kitties.</p>
      </div>
    );
  }

  let errorMessage = null;
  if (amountToAdopt < 1) {
    errorMessage = "*** You must adopt more than 0 kitties ***";
  } else if (
    amountLeftToAdopt != null &&
    amountLeftToAdopt - amountToAdopt < 0
  ) {
    errorMessage = `*** Only ${amountLeftToAdopt} kitt${
      amountLeftToAdopt === 1 ? "y" : "ies"
    } left available to adopt. More kitties will be put up soon ***`;
  }

  const disabled = errorMessage != null;

  return (
    <div>
      <p>
        Each kitty is a one of a kind digital pet
        <br />
        Adopt a kitty today
      </p>
      <CenterColumn
        extraStyle={{
          justifyContent: "flex-start",
          width: 50,
          alignItems: "flex-start",
        }}
      >
        <CenterColumn
          extraStyle={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingBottom: 20,
          }}
        >
          <p style={{ margin: 0, width: 80 }}>Kitties: </p>
          <input
            style={{
              borderRadius: 5,
              width: 80,
              border: "none",
              textAlign: "center",
              height: "2em",
            }}
            type="number"
            defaultValue={amountToAdopt}
            onChange={(e) => {
              const val = e?.target?.value;
              setAmountToAdopt(parseInt(val === "" ? "0" : val));
            }}
          />
        </CenterColumn>
        <button
          disabled={disabled}
          style={{
            width: 160,
            fontFamily: textFontFamily,
            fontSize: "16px",
            lineHeight: "30px",
            color: "white",
            background: disabled ? "gray" : "#249946",
            border: "none",
            borderRadius: 5,
          }}
          onClick={() =>
            adoptKitties(amountToAdopt, () => {
              setCurrScreen(SCREENS.MY_KITTIES);
            })
          }
        >
          {errorMessage == null &&
            `Adopt for ${pricePerKitty * amountToAdopt} KDA`}
          {errorMessage != null && "Read below"}
        </button>
        {/* </Button> */}
      </CenterColumn>
      <p style={{ fontSize: "1em", paddingTop: "10" }}>
        {errorMessage}
        {errorMessage == null && "(Kitties will be visible after adoption)"}
      </p>
    </div>
  );
}

function AllKitties() {
  const getAllKitties = useGetAllKitties();
  const { allKitties, setAllKitties } = useContext(GameContext);
  useEffect(() => {
    const fetchKitties = async () => {
      const kittyIds = await getAllKitties();
      const images = await getImagesForIds(kittyIds);
      setAllKitties(images);
    };
    fetchKitties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amount = allKitties?.length ?? 0;
  return (
    <CenterColumn>
      <KittiesList
        kitties={allKitties}
        loading={<Loading text="Gathering all the kitties..." />}
        empty={<p style={{ textAlign: "center" }}>No kitties exist yet :O</p>}
        header={`${amount} ${kittiesStr(amount)} adopted around the world`}
      />
    </CenterColumn>
  );
}

function KittiesList({ kitties, loading, empty, header }) {
  const hasKitties = kitties != null && kitties.length > 0;
  const extraStyle = { overflowY: "scroll" };
  if (hasKitties === true) {
    extraStyle.justifyContent = "flex-start";
  }
  return (
    <CenterColumn extraStyle={extraStyle}>
      {kitties != null && header != null && (
        <h2 style={{ color: "white", paddingTop: 10, fontSize: "25px" }}>
          {header}
        </h2>
      )}
      <div
        style={{
          display: "flex",
          direction: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {kitties === null && loading}
        {kitties?.length === 0 && empty}
        {kitties != null &&
          kitties.map((kitty) => {
            return (
              <KittyCard
                key={kitty.id}
                number={parseInt(kitty.id.split(":")[1]) + 1}
                traits={kitty.traits}
                genes={kitty.genes}
                items={kitty.items}
                base64={kitty.base64}
                imgStyle={smallKittyStyle}
              />
            );
          })}
      </div>
    </CenterColumn>
  );
}

function KittyCard({ base64, number, traits, genes, items, imgStyle }) {
  return (
    <div
      style={{
        ...centerColumnStyle,
        border: "solid 2px white",
        borderRadius: 21,
        margin: 9,
        maxWidth: 200,
        minWidth: 200,
        padding: "10 0",
      }}
      onClick={() =>
        navigator.clipboard.writeText(JSON.stringify([genes, items]))
      }
    >
      <p style={{ fontSize: "1.5em", padding: 0, margin: 0 }}>#{number}</p>
      <KittyImg base64={base64} extraStyle={imgStyle} />
      <p style={{ fontSize: "1em", marginBottom: 0, textAlign: "center" }}>
        Gen: 0
      </p>
    </div>
  );
}

function Loading({ text }) {
  return <p style={{ textAlign: "center" }}>{text}</p>;
}

function KittyImg({ base64, extraStyle }) {
  return (
    <img
      style={{ ...defaultImageStyle, ...extraStyle }}
      src={`data:image/png;base64,${base64}`}
      alt="a kitty kad"
    />
  );
}

function CenterColumn({ children, extraStyle }) {
  return (
    <div style={{ ...centerColumnStyle, ...extraStyle, width: "100%" }}>
      {children}
    </div>
  );
}

function KittyGuideWithContent({ children }) {
  return (
    <CenterColumn extraStyle={{ flexDirection: "row" }}>
      <div style={{ width: 400 }}>{children}</div>
      <KittyGuide style={{ width: "20%" }} />
    </CenterColumn>
  );
}

function KittyGuide() {
  return (
    <div style={{ width: 400 }}>
      <img style={{ width: "100%" }} src="/img/kittykad.png" />
    </div>
  );
}

function ConnectWalletText() {
  const { openConnectWallet } = useContext(PactContext);
  return (
    <div>
      <p>
        <span
          onClick={openConnectWallet}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Connect wallet{" "}
        </span>{" "}
        to get started <br />
        or explore existing kitties
      </p>
    </div>
  );
}

function kittiesStr(amountOfKitties) {
  return `kitt${amountOfKitties > 1 ? "ies" : "y"}`;
}

const screensStyle = {
  display: "flex",
  height: "600px",
  width: "100%",
  // overflowY: "scroll",
  "&::WebkitScrollbar": { width: 5 },
  padding: "20 0",

  //   flexDirection: "column",
};

const centerColumnStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const textFontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
sans-serif`;

const defaultImageStyle = { height: 320, imageRendering: "pixelated" };
const smallKittyStyle = { width: "100%", height: "auto" };
