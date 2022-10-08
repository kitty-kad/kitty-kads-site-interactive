import React, { useContext, useState, useEffect, useMemo } from "react";
import { GameContext } from "../game-context";
import { SCREENS } from "../consts";
import { SearchFilters } from "../search-utils";

import {
  useGetMyKitties,
  useGetAllKitties,
  useAdoptKitties,
  useAmountLeftToAdopt,
  ADMIN_ADDRESS,
} from "../pact-functions";
import { getImagesForIds, getKittiesForFilters } from "../server";
import { PactContext } from "../../../wallet/pact-wallet";

const PAGE_SIZE = 100;

export default function ScreenContainer(props) {
  const { currScreen, setAllKittiesData, allKittiesData } =
    useContext(GameContext);
  // const [kittiesToShow, setKittiesToShow] = useState(null);
  const getAllKitties = useGetAllKitties();

  // Initialize all kitties data
  useState(() => {
    (async () => {
      const allIds = await getAllKitties();
      const sortedAllIds = sortIds(allIds);
      const allIdsToSave = [];
      for (let i = 0; i < sortedAllIds.length; i++) {
        allIdsToSave.push(null);
      }
      setAllKittiesData(allIdsToSave);
    })();
  });

  return (
    <div style={screensStyle}>
      {currScreen == null && <Landing />}
      {currScreen === SCREENS.MY_KITTIES && allKittiesData != null && (
        <MyKitties />
      )}
      {currScreen === SCREENS.ALL_KITTIES && allKittiesData != null && (
        <AllKitties />
      )}
      {currScreen === SCREENS.ADOPT && <AdoptKitties />}
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
  const ADOPT_FOR_ALL = true;
  const { account } = useContext(PactContext);
  const hasAccount = account?.account != null;

  let content = null;
  if (!ADOPT_FOR_ALL && account?.account !== ADMIN_ADDRESS) {
    content = (
      <>
        <p> Current sale is all sold out :O</p>
        <p>Final 5,000 Gen 0s will be live on the 23rd of April.</p>
      </>
    );
  } else if (!hasAccount) {
    content = (
      <>
        <p>Can't adopt without a wallet!</p>
        <ConnectWalletText />
      </>
    );
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
        <p> All Gen 0 kitties have been sold out!</p>
        <p>Thank you all for supporting the first NFT collection on Kadena!</p>
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
    } left available to adopt ***`;
  } else if (amountToAdopt > 50) {
    errorMessage = "Maximum 50 kitties in one transaction";
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

function idToIndex(id) {
  return parseInt(id.split(":")[1]);
}
function sortIds(ids) {
  // Copy the ids so we don't mutate the original and sort
  return [...ids].sort((id1, id2) => idToIndex(id1) - idToIndex(id2));
}

function idsNeededForPage(page) {
  const ids = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    ids.push(`1:${page * PAGE_SIZE + i}`);
  }
  return ids;
}

function idsToFetch(idsNeeded, allKittiesData) {
  const toFetch = [];
  for (let i = 0; i < idsNeeded.length; i++) {
    const id = idsNeeded[i];
    const index = idToIndex(id);
    if (allKittiesData[index] == null) {
      toFetch.push(id);
    }
  }
  return toFetch;
}

// function idsToShow(page, allKittiesData) {
//   // if (searchParams == null) {
//   return idsNeededForPage(page, allKittiesData);
//   // } else if (searchParams.id != null) return [`1:${searchParams.id - 1}`];
//   // return [];
//   // }
// }

function getNewAllKittiesData(allKittiesData, fetchedData) {
  const updatedData = [...allKittiesData];
  for (let i = 0; i < fetchedData.length; i++) {
    const id = fetchedData[i].id;
    const index = idToIndex(id);
    updatedData[index] = fetchedData[i];
  }
  return updatedData;
}

function getPagesCount(kittiesCount) {
  return Math.ceil(kittiesCount / PAGE_SIZE);
}

function getKittiesToShowData(ids, allKittiesData) {
  return ids.map((id) => allKittiesData[idToIndex(id)]);
}

function AllKitties() {
  const {
    allKittiesData,
    setAllKittiesData,
    pagesInfo,
    setPagesInfo,
    searchParams,
    setSearchParams,
  } = useContext(GameContext);
  // const pages = getPagesCount(pagesInfo?.kittiesCount ?? 0);

  const fetchNeededImagesAndSetIdsToShowForPage = async (
    idsToShow,
    newPage
  ) => {
    const idsNotLoaded = idsToFetch(idsToShow, allKittiesData);
    setPagesInfo({ page: 0 });
    let newAllData = allKittiesData;
    if (idsNotLoaded.length !== 0) {
      const fetchedData = await getImagesForIds(idsNotLoaded);
      newAllData = getNewAllKittiesData(allKittiesData, fetchedData);
      setAllKittiesData(newAllData);
    }
    const newKittiesToShow = getKittiesToShowData(idsToShow, newAllData);
    setPagesInfo({
      kittiesToShow: newKittiesToShow,
      page: newPage,
      pages: getPagesCount(allKittiesData.length),
    });
  };

  const updateSearchParams = (newSearchParams, newPage = 0) => {
    // Not ready to search backend
    if (allKittiesData == null) {
      return;
    }
    if (newSearchParams.id != null) {
      fetchNeededImagesAndSetIdsToShowForPage([newSearchParams.id], 0);
      setSearchParams(newSearchParams);
      return;
    }
    if (newSearchParams?.filters == null) {
      const idsToShow = idsNeededForPage(0);
      fetchNeededImagesAndSetIdsToShowForPage(idsToShow, 0);
      setSearchParams(newSearchParams);
      return;
    }
    const searchFiltersFromServer = async (params, newPage) => {
      setPagesInfo({});
      setSearchParams(params);
      const {
        kitties: fetchedData,
        pages,
        count,
      } = await getKittiesForFilters({
        ...params,
        offset: PAGE_SIZE * newPage,
      });
      const newAllData = getNewAllKittiesData(allKittiesData, fetchedData);
      setAllKittiesData(newAllData);
      const idsToShow = fetchedData.map((kitty) => kitty.id);
      const newKittiesToShow = getKittiesToShowData(idsToShow, newAllData);
      setPagesInfo({
        kittiesToShow: newKittiesToShow,
        page: newPage,
        pages,
        count,
      });
    };
    searchFiltersFromServer(newSearchParams, newPage);
  };

  const updatePage = (newPage) => {
    if (searchParams?.filters != null) {
      updateSearchParams(searchParams, newPage);
      return;
    }
    // Fetch specific ids to show if not loaded and show all ids
    const idsToShow = idsNeededForPage(newPage);
    fetchNeededImagesAndSetIdsToShowForPage(idsToShow, newPage);
  };

  // Handle first load
  useEffect(() => {
    if (pagesInfo?.kittiesToShow == null) {
      updatePage(0);
    }
  }, []);

  let headerText = "";
  if (pagesInfo?.count != null) {
    headerText = `${pagesInfo.count} kitties found`;
  } else if (
    Object.keys(searchParams ?? {}).length === 0 &&
    allKittiesData?.length != null
  ) {
    headerText = `${allKittiesData.length} ${kittiesStr(
      allKittiesData.length
    )} adopted around the world`;
  }

  return (
    <CenterColumn>
      <KittiesList
        pages={pagesInfo?.pages ?? 1}
        page={pagesInfo?.page ?? 0}
        setPage={updatePage}
        kitties={pagesInfo?.kittiesToShow}
        loading={<Loading text="Fetching kitties..." />}
        empty={<p style={{ textAlign: "center" }}>No kitties found :O</p>}
        header={headerText}
        search={<SearchFilters setSearchParams={updateSearchParams} />}
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
              return <KittyCard key={kitty.id} kitty={kitty} />;
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

function KittyCard({ kitty, showFeatures, notClickable }) {
  const { id } = kitty;
  const number = parseInt(kitty.id.split(":")[1]) + 1;
  const imgStyle = smallKittyStyle;
  const { setCurrKitty, setCurrScreen } = useContext(GameContext);
  return (
    <div
      style={{ cursor: notClickable === true ? "normal" : "pointer" }}
      onClick={
        () => {
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
        }
        // navigator.clipboard.writeText(JSON.stringify([genes, items]))
      }
    >
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
          <div>
            {kitty.allFeatures != null && (
              <FeaturesInfo {...kitty?.allFeatures} />
            )}
          </div>
        )}
        <div
          style={{
            ...centerColumnStyle,
            maxWidth: 200,
            minWidth: 200,
            padding: "10 0",
          }}
        >
          <p style={{ fontSize: "1.5em", padding: 0, margin: 0 }}>#{number} </p>
          <p
            style={{
              padding: 0,
              margin: 0,
              fontSize: "1em",
              padding: 0,
              margin: 0,
            }}
          >{`(ID: ${id})`}</p>
          <KittyImg
            // TODO standardise naming
            base64={kitty.base64 ?? kitty.base_64}
            extraStyle={imgStyle}
          />
          <p style={{ fontSize: "1em", marginBottom: 0, textAlign: "center" }}>
            Gen: 0
          </p>
        </div>
      </CenterRow>
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

function kittiesStr(amountOfKitties) {
  return `kitt${amountOfKitties > 1 ? "ies" : "y"}`;
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
