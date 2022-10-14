import React, { useContext, useState, useEffect, useMemo } from "react";
import { GameContext } from "../game-context";
import { SCREENS, KITTY_ACTIONS } from "../consts";
import { SearchFilters } from "../search-utils";
import Button from "@mui/material/Button";

import {
  useFetchAllKittiesInit,
  useImageSearchAndUpdateHelpers,
  getPagesCount,
  idToIndex,
} from "./screen-helpers";
import {
  useGetMyKitties,
  useGetKittiesOnSale,
  useGetKittyActions,
  useGetPricesForKitties,
} from "../pact-functions";
import { PactContext } from "../../../wallet/pact-wallet";

export default function ScreenContainer(props) {
  const { currScreen, allKittiesData } = useContext(GameContext);
  useFetchAllKittiesInit();

  return (
    <div style={screensStyle}>
      {currScreen == null && <Landing />}
      {allKittiesData != null ? (
        <>
          {currScreen === SCREENS.MY_KITTIES && <MyKitties />}
          {currScreen === SCREENS.ALL_KITTIES && allKittiesData != null && (
            <AllKitties />
          )}
        </>
      ) : null}
      {currScreen === SCREENS.BUY && <BuyKitties />}
      {currScreen === SCREENS.DETAILS && <SelectedKitty />}
    </div>
  );
}

function Landing() {
  const { account } = useContext(PactContext);
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
  const { pagesInfo } = useContext(GameContext);
  const {
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
  } = useImageSearchAndUpdateHelpers();

  const currScreen = SCREENS.MY_KITTIES;

  const getMyKitties = useGetMyKitties();
  useEffect(() => {
    if (account?.account == null) {
      return;
    }
    handleFirstLoad(async () => {
      return (await getMyKitties()).map((kitty) => kitty.id);
    }, currScreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, pagesInfo]);

  const { page, allResultsIds, currIds } = pagesInfo[currScreen] ?? {};

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [currIds, getCurrKittiesAndIsLoading]);

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

  const headerText = getHeaderText(currScreen, "were given a home by you");
  return (
    <KittiesList
      pages={getPagesCount(allResultsIds?.length ?? 1)}
      page={page ?? 0}
      setPage={(number) => updatePageNum(number, currScreen)}
      kitties={stillLoading ? null : currKitties}
      loading={<Loading text="Looking for your kitties..." />}
      empty={<p style={{ textAlign: "center" }}>No kitties found :O</p>}
      header={headerText}
      search={
        <SearchFilters
          setSearchParams={(params) => updateSearchParams(params, currScreen)}
        />
      }
    />
  );
}

function BuyKitties() {
  const { pagesInfo, allKittiesData, setAllKittiesData } =
    useContext(GameContext);
  const {
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
  } = useImageSearchAndUpdateHelpers();

  const currScreen = SCREENS.BUY;

  const getKittiesOnSale = useGetKittiesOnSale();
  const getPricesForKitties = useGetPricesForKitties();

  useEffect(() => {
    (async () => {
      const ids = (await getKittiesOnSale()).map((kitty) => kitty.id);
      handleFirstLoad(async () => ids, currScreen);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { page, allResultsIds, currIds, defaultIds } =
    pagesInfo[currScreen] ?? {};

  useEffect(() => {
    if (defaultIds == null) {
      return;
    }
    (async () => {
      const idsWithoutPrices = [];
      for (let i = 0; i < defaultIds.length; i++) {
        const id = defaultIds[i];
        const index = idToIndex(id);
        if (allKittiesData[index].price == null) {
          idsWithoutPrices.push(id);
        }
      }
      if (idsWithoutPrices.length === 0) {
        return;
      }
      const prices = (await getPricesForKitties(idsWithoutPrices)).map(
        (kitty) => kitty.price
      );
      if (prices.length !== idsWithoutPrices.length) {
        console.log("ERROR: Invalid amount of prices returned");
        return;
      }
      const newAllKittiesData = [...allKittiesData];
      for (let i = 0; i < idsWithoutPrices.length; i++) {
        const id = idsWithoutPrices[i];
        const index = idToIndex(id);
        newAllKittiesData[index].price = prices[i];
      }
      setAllKittiesData(newAllKittiesData);
    })();
  }, [defaultIds, allKittiesData, setAllKittiesData, getPricesForKitties]);

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [currIds, getCurrKittiesAndIsLoading]);

  const headerText = getHeaderText(currScreen, "are up for sale");
  return (
    <KittiesList
      pages={getPagesCount(allResultsIds?.length ?? 1)}
      page={page ?? 0}
      setPage={(number) => updatePageNum(number, currScreen)}
      kitties={stillLoading ? null : currKitties}
      loading={<Loading text="Looking for kitties on sale..." />}
      empty={<p style={{ textAlign: "center" }}>No kitties found :O</p>}
      header={headerText}
      showPrice={true}
      search={
        <SearchFilters
          setSearchParams={(params) => updateSearchParams(params, currScreen)}
        />
      }
    />
  );
}

function AllKitties() {
  const { allKittiesData, pagesInfo } = useContext(GameContext);
  const {
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
  } = useImageSearchAndUpdateHelpers();

  const currScreen = SCREENS.ALL_KITTIES;

  // Handle first load
  useEffect(() => {
    handleFirstLoad(async () => {
      return allKittiesData.map((kitty) => kitty.id);
    }, currScreen);
  }, []);

  const currPageInfo = pagesInfo[currScreen] ?? {};
  const { currIds, allResultsIds, page } = currPageInfo;

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [currIds, getCurrKittiesAndIsLoading]);

  const headerText = getHeaderText(currScreen, "adopted around the world");

  return (
    <CenterColumn>
      <KittiesList
        pages={getPagesCount(allResultsIds?.length ?? 1)}
        page={page ?? 0}
        setPage={(number) => updatePageNum(number, currScreen)}
        kitties={stillLoading ? null : currKitties}
        loading={<Loading text="Fetching kitties..." />}
        empty={<p style={{ textAlign: "center" }}>No kitties found :O</p>}
        header={headerText}
        search={
          <SearchFilters
            setSearchParams={(params) => updateSearchParams(params, currScreen)}
          />
        }
      />
    </CenterColumn>
  );
}

function KittiesList({
  kitties,
  loading,
  empty,
  header,
  pages,
  page,
  setPage,
  search,
  showPrice,
}) {
  const hasKitties = kitties != null && kitties.length > 0;
  const extraStyle = { overflowY: "scroll" };
  if (hasKitties === true) {
    extraStyle.justifyContent = "flex-start";
  }

  return (
    <CenterColumn extraStyle={extraStyle}>
      {kitties != null && kitties.length !== 0 && header != null && (
        <h2
          style={{
            color: "white",
            paddingTop: 10,
            fontSize: "25px",
            marginBottom: "10px",
          }}
        >
          {header}
        </h2>
      )}
      <div style={kitties == null ? { display: "none" } : null}>{search}</div>
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
        {kitties == null && loading}
        {kitties?.length === 0 && empty}
        {kitties != null && (
          <>
            {kitties.map((kitty) => {
              return (
                <KittyCard key={kitty.id} kitty={kitty} showPrice={showPrice} />
              );
            })}
            <ListNav pages={pages} page={page} setPage={setPage} />
          </>
        )}
      </div>
    </CenterColumn>
  );
}

function ListNav({ pages, page, setPage }) {
  if (pages == null || page == null || setPage == null) {
    return null;
  }
  const pagesArr = [1];
  const start = Math.max(page + 1 - 3, 2);
  const end = Math.min(page + 1 + 4, pages);
  for (let i = start; i < end; i++) {
    pagesArr.push(i);
  }
  pagesArr.push(pages);

  const navButtons = [];
  for (let i = 0; i < pagesArr.length; i++) {
    const curr = pagesArr[i];
    if (
      (i === 1 && curr !== 2) ||
      (i === pagesArr.length - 2 && curr !== pages - 1)
    ) {
      navButtons.push(<p key={i}>...</p>);
    } else {
      navButtons.push(
        <NavButton
          key={i}
          text={curr}
          isSelected={page + 1 === curr}
          onClick={() => setPage(curr - 1)}
        />
      );
    }
  }

  return (
    <CenterColumn
      extraStyle={{
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {navButtons.map((button, i) => button)}
    </CenterColumn>
  );
}

function NavButton({ text, onClick, isSelected }) {
  const style = { cursor: "pointer" };
  if (isSelected === true) {
    style.fontWeight = "bold";
  } else {
    style.textDecoration = "underline";
  }
  return (
    <p style={style} onClick={onClick}>
      {text}
    </p>
  );
}

function SelectedKitty() {
  const { currKitty, setCurrScreen, lastScreen } = useContext(GameContext);

  if (currKitty == null) {
    return;
  }
  return (
    <CenterColumn>
      <p
        style={{
          cursor: "pointer",
          // margin: "0 50",
        }}
        onClick={() => setCurrScreen(lastScreen)}
      >
        ⬅ Back
      </p>
      <KittyCard kitty={currKitty} showFeatures={true} notClickable={true} />
    </CenterColumn>
  );
}

function FeaturesInfo(allFeatures) {
  const features = Object.entries(allFeatures).map((entry) => entry[1]);
  return (
    <div>
      {features.map((feature, i) => {
        if (feature.templateType === "color") {
          return null;
        }
        return <Feature key={i} {...feature} />;
      })}
    </div>
  );
}

function Feature(feature) {
  const subFeatures = feature.features?.filter((f) => f != null && f !== "");
  return (
    <div>
      <FeatureText
        text={`${prettifyUnderscoreText(
          feature.templateType
        )}: ${prettifyUnderscoreText(feature.templateId)}`}
      />
      {subFeatures != null && subFeatures.length > 0 && (
        <FeatureText
          isSubFeature={true}
          text={`Sub-features: ${feature.features.join(", ")}`}
        />
      )}
    </div>
  );
}

function FeatureText({ text, isSubFeature }) {
  return (
    <p
      style={{
        fontSize: isSubFeature ? "0.75em" : "1em",
        margin: 0,
        marginLeft: isSubFeature ? 10 : 0,
      }}
    >
      {text}
    </p>
  );
}

function prettifyUnderscoreText(field) {
  const s = field.toLowerCase();
  return s.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase()
  );
}

function KittyCard({ kitty, showFeatures, notClickable, showPrice }) {
  const { id } = kitty;
  const number = parseInt(kitty.id.split(":")[1]) + 1;
  const imgStyle = smallKittyStyle;
  const { setCurrKitty, setCurrScreen, allKittiesData, setAllKittiesData } =
    useContext(GameContext);
  const { account } = useContext(PactContext);
  const features = kitty?.allFeatures ?? kitty?.features;
  const getActions = useGetKittyActions();
  const [availableActions, setAvailableActions] = useState(null);
  useEffect(() => {
    (async () => {
      if (showFeatures !== true || availableActions != null) {
        return;
      }
      const userAccount = account?.account;
      const { nftData, marketData } = await getActions(id);
      let onSale = false;
      if (marketData != null) {
        onSale = marketData.owner === nftData?.owner;
      }
      const isOwner = userAccount != null && userAccount === nftData?.owner;
      const tempActions = [];
      if (onSale) {
        if (isOwner) {
          tempActions.push(KITTY_ACTIONS.REMOVE_FROM_SALE);
        } else {
          if (userAccount == null) {
            tempActions.push(KITTY_ACTIONS.LOGIN_TO_BUY);
          } else {
            tempActions.push(KITTY_ACTIONS.CAN_BUY);
          }
        }
      } else if (isOwner) {
        tempActions.push(KITTY_ACTIONS.PUT_ON_SALE);
      }
      setAvailableActions(tempActions);

      // If we're updating actions, also try to get the latest price and update
      if (kitty.price !== marketData?.price) {
        const index = idToIndex(id);
        const newAllKittiesData = [...allKittiesData];
        newAllKittiesData[index].price = marketData?.price;
        setAllKittiesData(newAllKittiesData);
      }
    })();
  }, [
    showFeatures,
    account?.account,
    setAvailableActions,
    getActions,
    availableActions,
    id,
    allKittiesData,
    setAllKittiesData,
    kitty,
  ]);

  return (
    <div
      style={{ cursor: notClickable === true ? "normal" : "pointer" }}
      onClick={() => {
        if (notClickable === true) {
          return;
        }
        if (id === "1:0") {
          alert(
            "This is the original Kitty Kad. It has no special features and can't be interacted with.\nPlease select another one 🐱"
          );
          return;
        }
        setCurrScreen(SCREENS.DETAILS);
        setCurrKitty(kitty);
      }}
    >
      <CenterRow>
        <div style={{ marginRight: 20 }}>
          {availableActions?.map((action) => {
            return (
              <KittyActionButton key={action} kitty={kitty} action={action} />
            );
          })}
        </div>
        <CenterRow
          extraStyle={{
            border: "solid 2px white",
            borderRadius: 21,
            margin: 9,
            padding: "10 20",
            width: "max-content",
          }}
        >
          {showFeatures && (
            <div>{features != null && <FeaturesInfo {...features} />}</div>
          )}
          <div
            style={{
              ...centerColumnStyle,
              maxWidth: 200,
              minWidth: 200,
              padding: "10 0",
            }}
          >
            <p style={idPStyle}>#{number} </p>
            <p style={minimalistPStyle}>{`(ID: ${id})`}</p>
            <KittyImg
              // TODO standardise naming
              base64={kitty.base64 ?? kitty.base_64}
              extraStyle={imgStyle}
            />
            <p
              style={{ fontSize: "1em", marginBottom: 0, textAlign: "center" }}
            >
              Gen: 0
            </p>
            {showPrice && !showFeatures && kitty.price != null && (
              <p style={idPStyle}>{`${kitty.price} KDA`}</p>
            )}
          </div>
        </CenterRow>
      </CenterRow>
    </div>
  );
}

function KittyActionButton({ kitty, action }) {
  const { id } = kitty;
  const arkadeLink = `https://www.arkade.fun/market/kitty-kad/${id}`;
  if (action === KITTY_ACTIONS.CAN_BUY) {
    return (
      <button
        className="btn btn-custom btn-sm"
        style={{ fontSize: 10, padding: "10 20" }}
        onClick={() => window.open(arkadeLink, "_blank")}
      >
        {`Buy for ${kitty.price} KDA`}
      </button>
    );
  }
  return null;
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

export function CenterColumn({ children, extraStyle }) {
  return (
    <div style={{ ...centerColumnStyle, width: "100%", ...extraStyle }}>
      {children}
    </div>
  );
}

export function CenterRow({ children, extraStyle }) {
  return (
    <div
      style={{
        ...centerColumnStyle,
        flexDirection: "row",
        width: "100%",
        ...extraStyle,
      }}
    >
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

const screensStyle = {
  display: "flex",
  height: "700px",
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

export const textFontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
sans-serif`;

const defaultImageStyle = { height: 320, imageRendering: "pixelated" };
const smallKittyStyle = { width: "100%", height: "auto" };

const minimalistPStyle = { fontSize: "1em", padding: 0, margin: 0 };

const idPStyle = { fontSize: "1.5em", padding: 0, margin: 0 };

// function AdoptKittiesInteraction() {
//   const adoptKitties = useAdoptKitties();
//   const amountLeftToAdopt = useAmountLeftToAdopt();
//   const [amountToAdopt, setAmountToAdopt] = useState(1);
//   const { pricePerKitty, setCurrScreen } = useContext(GameContext);

//   if (amountLeftToAdopt === 0) {
//     return (
//       <div>
//         <p> All Gen 0 kitties have been sold out!</p>
//         <p>Thank you all for supporting the first NFT collection on Kadena!</p>
//       </div>
//     );
//   }

//   let errorMessage = null;
//   if (amountToAdopt < 1) {
//     errorMessage = "*** You must adopt more than 0 kitties ***";
//   } else if (
//     amountLeftToAdopt != null &&
//     amountLeftToAdopt - amountToAdopt < 0
//   ) {
//     errorMessage = `*** Only ${amountLeftToAdopt} kitt${
//       amountLeftToAdopt === 1 ? "y" : "ies"
//     } left available to adopt ***`;
//   } else if (amountToAdopt > 50) {
//     errorMessage = "Maximum 50 kitties in one transaction";
//   }

//   const disabled = errorMessage != null;

//   return (
//     <div>
//       <p>
//         Each kitty is a one of a kind digital pet
//         <br />
//         Adopt a kitty today
//       </p>
//       <CenterColumn
//         extraStyle={{
//           justifyContent: "flex-start",
//           width: 50,
//           alignItems: "flex-start",
//         }}
//       >
//         <CenterColumn
//           extraStyle={{
//             flexDirection: "row",
//             justifyContent: "flex-start",
//             paddingBottom: 20,
//           }}
//         >
//           <p style={{ margin: 0, width: 80 }}>Kitties: </p>
//           <input
//             style={{
//               borderRadius: 5,
//               width: 80,
//               border: "none",
//               textAlign: "center",
//               height: "2em",
//             }}
//             type="number"
//             defaultValue={amountToAdopt}
//             onChange={(e) => {
//               const val = e?.target?.value;
//               setAmountToAdopt(parseInt(val === "" ? "0" : val));
//             }}
//           />
//         </CenterColumn>
//         <button
//           disabled={disabled}
//           style={{
//             width: 160,
//             fontFamily: textFontFamily,
//             fontSize: "16px",
//             lineHeight: "30px",
//             color: "white",
//             background: disabled ? "gray" : "#249946",
//             border: "none",
//             borderRadius: 5,
//           }}
//           onClick={() =>
//             adoptKitties(amountToAdopt, () => {
//               setCurrScreen(SCREENS.MY_KITTIES);
//             })
//           }
//         >
//           {errorMessage == null &&
//             `Adopt for ${pricePerKitty * amountToAdopt} KDA`}
//           {errorMessage != null && "Read below"}
//         </button>
//         {/* </Button> */}
//       </CenterColumn>
//       <p style={{ fontSize: "1em", paddingTop: "10" }}>
//         {errorMessage}
//         {errorMessage == null && "(Kitties will be visible after adoption)"}
//       </p>
//     </div>
//   );
// }
