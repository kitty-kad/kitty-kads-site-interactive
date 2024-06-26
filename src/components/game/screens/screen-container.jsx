import React, { useContext, useState, useEffect, useMemo } from "react";
import { GameContext } from "../game-context";
import { SCREENS, KITTY_ACTIONS, SORT_KEYS } from "../consts";
import { useGetOwnedBy } from "../server";
import { SearchFilters } from "../search-utils";
import { SortDropdown } from "../sort-utils";
import PutOnSale from "./interaction-popups/PutOnSale";
import Transfer from "./interaction-popups/Transfer";
import kadenaiImg from '../../../kadenai.svg';

import {
  useFetchAllKittiesInit,
  useImageSearchAndUpdateHelpers,
  getPagesCount,
  idToIndex,
  idsForGen,
  sortKitties,
} from "./screen-helpers";
import {
  useGetKittiesOnSale,
  useGetKittyActions,
  useGetPricesForKitties,
  useBuyKitty,
  useRemoveFromSale,
  useGetChildrenForKitty,
} from "../pact-functions";
import { PactContext } from "../../../wallet/pact-wallet";
import { useCallback } from "react";

export default function ScreenContainer(props) {
  useFetchAllKittiesInit();
  const { currScreen, allKittiesData } = useContext(GameContext);
  return (
    <div style={screensStyle}>
      {currScreen == null && <Landing />}
      {allKittiesData.length !== 0 && (
        <>
          {currScreen === SCREENS.MY_KITTIES && <MyKitties />}
          {currScreen === SCREENS.ALL_KITTIES && allKittiesData != null && (
            <AllKitties />
          )}
          {currScreen === SCREENS.BUY && <BuyKitties />}
          {currScreen === SCREENS.DETAILS && <SelectedKitty />}
          {currScreen === SCREENS.GEN_1_KITTIES && <Gen1Kitties />}
        </>
      )}
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

function useFirstLoadMyKitties(currScreen) {
  const { account } = useContext(PactContext);
  const { handleFirstLoad } = useImageSearchAndUpdateHelpers();
  const getMyKitties = useGetOwnedBy();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (account?.account == null) {
      return;
    }
    setLoading(true);
  }, [account]);

  useEffect(() => {
    if (loading === false) {
      return;
    }
    handleFirstLoad(
      async () => {
        return await getMyKitties(account.account);
      },
      currScreen,
      SORT_KEYS.LOWEST_ID,
      (idsToFilter) => idsForGen(idsToFilter, 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
}

function MyKitties() {
  const { account } = useContext(PactContext);
  const { pagesInfo } = useContext(GameContext);
  const currScreen = SCREENS.MY_KITTIES;
  const {
    updateSearchParams,
    updatePageNum,
    getHeaderText,
    getCurrKittiesAndIsLoading,
    updateGen,
  } = useImageSearchAndUpdateHelpers();
  useFirstLoadMyKitties(currScreen);

  const { page, allResultsIds, currIds } = pagesInfo[currScreen] ?? {};
  const [gen0Override, setGen0Ovveride] = useGen0Override(currScreen);

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [getCurrKittiesAndIsLoading, currIds]);

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

  const headerText = getHeaderText(
    currScreen,
    gen0Override === 0
      ? "Gen 0s were given a home by you"
      : "Gen 1s were given a home by you"
  );
  return (
    <div>
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
            gen0Override={gen0Override}
            setGen0Ovveride={(gen) => {
              updateGen(currScreen, gen);
              setGen0Ovveride(gen);
            }}
            setSearchParams={(params, gen) =>
              updateSearchParams(params, currScreen, null, gen)
            }
          />
        }
      />
      <CenterColumn extraStyle={{ marginTop: 20 }}>
        <p>{'powered with ❤️ by Kadenai'}</p>
        <img
          style={{ maxWidth: 100 }}
          src={kadenaiImg}
          alt="powered by Kadenai"
        />
      </CenterColumn>
  </div>
  );
}

function useGen0Override(currScreen) {
  const { pagesInfo } = useContext(GameContext);
  const { allResultsIds } = pagesInfo[currScreen] ?? {};
  const [gen0Override, setGen0Ovveride] = useState(() => {
    if (allResultsIds == null || allResultsIds.legth === 0) {
      return 0;
    }
    return allResultsIds[0].includes(":") ? 0 : 1;
  });
  return [gen0Override, setGen0Ovveride];
}

function BuyKitties() {
  const { pagesInfo, allKittiesData, setAllKittiesData } =
    useContext(GameContext);
  const {
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    updatePagesInfo,
    getCurrKittiesAndIsLoading,
    updateGen,
  } = useImageSearchAndUpdateHelpers();

  const currScreen = SCREENS.BUY;

  const getKittiesOnSale = useGetKittiesOnSale();
  const getPricesForKitties = useGetPricesForKitties();
  const [sortKey, setSortKey] = useState(SORT_KEYS.LOWEST_ID);
  const [gen0Override, setGen0Ovveride] = useGen0Override(currScreen);

  useEffect(() => {
    (async () => {
      const ids = (await getKittiesOnSale()).map((kitty) => kitty.id);
      handleFirstLoad(
        async () => ids,
        currScreen,
        SORT_KEYS.LOWEST_ID,
        (idsToFilter) => idsForGen(idsToFilter, gen0Override)
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { page, allResultsIds, currIds, defaultIds } =
    pagesInfo[currScreen] ?? {};

  useEffect(() => {
    if (defaultIds == null || allKittiesData.length === 0) {
      return;
    }
    (async () => {
      const idsWithoutPrices = [];
      for (let i = 0; i < defaultIds.length; i++) {
        const id = defaultIds[i];
        const index = idToIndex(id);
        if (allKittiesData[index]?.price == null) {
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
  }, [
    defaultIds,
    allKittiesData,
    setAllKittiesData,
    getPricesForKitties,
    updatePagesInfo,
    allResultsIds,
    sortKey,
    currScreen,
  ]);

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [currIds, getCurrKittiesAndIsLoading]);

  const updateSort = useCallback(
    (newSortKey) => {
      setSortKey(newSortKey);
      updatePagesInfo(
        defaultIds,
        sortKitties(allResultsIds, allKittiesData, newSortKey),
        currScreen
      );
    },
    [updatePagesInfo, defaultIds, allResultsIds, allKittiesData, currScreen]
  );

  const headerText = getHeaderText(
    currScreen,
    gen0Override === 0 ? "Gen 0s up for sale" : "Gen 1s up for sale"
  );
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
          gen0Override={gen0Override}
          setGen0Ovveride={(gen) => {
            updateGen(currScreen, gen);
            setGen0Ovveride(gen);
          }}
          setSearchParams={(params) =>
            updateSearchParams(params, currScreen, sortKey)
          }
        />
      }
      sort={<SortDropdown onChange={updateSort} />}
    />
  );
}

/** Technically just Gen 0 kitties */
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
      // Only load Gen 0s
      return allKittiesData.map((kitty) => kitty.id).slice(0, 10000);
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

function Gen1Kitties() {
  const { allKittiesData, pagesInfo } = useContext(GameContext);
  const {
    updateSearchParams,
    updatePageNum,
    handleFirstLoad,
    getHeaderText,
    getCurrKittiesAndIsLoading,
  } = useImageSearchAndUpdateHelpers();

  const currScreen = SCREENS.GEN_1_KITTIES;

  // Handle first load
  useEffect(() => {
    handleFirstLoad(async () => {
      return allKittiesData.map((kitty) => kitty.id).slice(10000, 15000);
    }, currScreen);
  }, []);

  const currPageInfo = pagesInfo[currScreen] ?? {};
  const { currIds, allResultsIds, page } = currPageInfo;

  const { currKitties, stillLoading } = useMemo(() => {
    return getCurrKittiesAndIsLoading(currIds);
  }, [currIds, getCurrKittiesAndIsLoading]);

  const headerText = getHeaderText(currScreen, "bred");

  // Search is disabled for now
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
            setSearchParams={(params) =>
              updateSearchParams(params, currScreen, null, 1)
            }
            gen={1}
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
  sort,
  onClickKitty,
}) {
  const hasKitties = kitties != null && kitties.length > 0;
  const extraStyle = { overflowY: "scroll" };
  if (hasKitties === true) {
    extraStyle.justifyContent = "flex-start";
  }

  return (
    <CenterColumn extraStyle={extraStyle}>
      {kitties != null && kitties.length !== 0 && header != null && (
        <Header text={header} />
      )}
      <CenterRow
        extraStyle={kitties?.length == null ? { display: "none" } : null}
      >
        {search}
        {sort && <div style={{ paddingLeft: 20 }}>{sort}</div>}
      </CenterRow>
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
                <KittyCard
                  key={kitty.id}
                  kitty={kitty}
                  showPrice={showPrice}
                  onClickKitty={onClickKitty}
                />
              );
            })}
            <ListNav pages={pages} page={page} setPage={setPage} />
          </>
        )}
      </div>
    </CenterColumn>
  );
}

function Header({ text }) {
  return (
    <h2
      style={{
        textAlign: "center",
        color: "white",
        paddingTop: 10,
        fontSize: "25px",
        marginBottom: "10px",
      }}
    >
      {text}
    </h2>
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
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
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
    </div>
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

function getNumberFromId(id) {
  if (id.includes(":")) {
    return parseInt(id.split(":")[1]) + 1;
  }
  return parseInt(id);
}

function noParents(kitty) {
  const { gen, parent1Id, parent2Id } = kitty;
  if (gen === 0 || !parent1Id || !parent2Id) {
    return true;
  }
  return false;
}

function KittyChildren({ kitty }) {
  const { fetchNeededImages, getCurrKittiesAndIsLoading } =
    useImageSearchAndUpdateHelpers();
  const [childIds, setChildIds] = useState(null);
  const { id } = kitty;
  useEffect(() => {
    (async () => {
      const ids = []; // TODO GETCH CHILDREN KITTIES
      // const ids = await getChildrenForKitty(id);
      await fetchNeededImages(ids);
      setChildIds(ids);
    })();
  }, []);

  const { currKitties: childKitties, stillLoading } =
    getCurrKittiesAndIsLoading(childIds ?? []);
  if (childIds == null || stillLoading) {
    return <p>... Checking for child kitties ...</p>;
  }
  if (childIds.length === 0) {
    return null;
  }
  return (
    <div style={{ paddingBottom: 20 }}>
      <SmallKitties
        kitties={childKitties}
        text={`It's Kittens (${childKitties?.length ?? 0})`}
      />
    </div>
  );
}

function SmallKitties({ kitties, text }) {
  if (kitties == null || kitties.length === 0) {
    return null;
  }
  return (
    <CenterColumn extraStyle={{ paddingTop: 20, maxWidth: 500 }}>
      <p style={{ marginBottom: 30 }}>{text}</p>
      <CenterRow extraStyle={{ overflowX: "hidden", flexWrap: "wrap" }}>
        {kitties.map((kitty) => {
          return (
            <KittyCard
              key={kitty.id}
              kitty={kitty}
              notClickable={true}
              extraSmall={true}
            />
          );
        })}
      </CenterRow>
    </CenterColumn>
  );
}

function KittyParents({ kitty }) {
  const { fetchNeededImages, getCurrKittiesAndIsLoading } =
    useImageSearchAndUpdateHelpers();
  const { parent1Id, parent2Id } = kitty;

  // do this to prevent resetting the pointer to parent ids
  // and causing refreshes
  const [parentIds] = useState([parent1Id, parent2Id]);
  const [parentless] = useState(() => noParents(kitty));

  useEffect(() => {
    if (parentless) {
      return;
    }
    (async () => {
      await fetchNeededImages(parentIds);
    })();
  }, [fetchNeededImages, parentIds, parentless]);

  const { currKitties: parentKitties, stillLoading } = useMemo(() => {
    if (parentless) {
      return { currKitties: [], stillLoading: true };
    }
    return getCurrKittiesAndIsLoading(parentIds);
  }, [parentIds, getCurrKittiesAndIsLoading, parentless]);

  if (noParents(kitty)) {
    return null;
  }

  if (stillLoading) {
    return <p>Looking for the parents</p>;
  }
  return <SmallKitties kitties={parentKitties} text="The Happy Parents" />;
}

function KittyCard({
  kitty,
  showFeatures,
  notClickable,
  showPrice,
  onClickKitty,
  small,
  extraSmall,
}) {
  const { id } = kitty;
  const number = getNumberFromId(id);
  const gen = id.includes(":") ? 0 : 1;
  const imgStyle = smallKittyStyle;
  const {
    setCurrKitty,
    setCurrScreen,
    currScreen,
    allKittiesData,
    setAllKittiesData,
  } = useContext(GameContext);
  const { account } = useContext(PactContext);
  const features = kitty?.allFeatures ?? kitty?.features;
  const getActions = useGetKittyActions();
  const [availableActions, setAvailableActions] = useState(null);
  const isBreedScreen = currScreen === SCREENS.BREED;
  const showParents = gen === 1 && showFeatures === true;

  useEffect(() => {
    (async () => {
      if (showFeatures !== true || availableActions != null) {
        return;
      }
      const userAccount = account?.account;
      const { nftData, marketData } = await getActions(id);
      let onSale = false;
      if (marketData != null) {
        onSale =
          marketData.owner === nftData?.owner &&
          marketData["for-sale"] === true;
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
      }
      if (isOwner && !onSale) {
        tempActions.push(KITTY_ACTIONS.PUT_ON_SALE);
      }
      if (isOwner) {
        tempActions.push(KITTY_ACTIONS.TRANSFER);
      }
      setAvailableActions(tempActions);

      // If we're updating actions, also try to get the latest price and update
      if (kitty.price !== marketData?.price || kitty.owner !== nftData?.owner) {
        const index = idToIndex(id);
        const newAllKittiesData = [...allKittiesData];
        newAllKittiesData[index].price = marketData?.price;
        newAllKittiesData[index].owner = nftData?.owner;
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

  const borderStyle = gen === 0 ? "solid 2px" : "dashed 1px";
  const zoom = (() => {
    if (small) {
      return 0.75;
    } else if (extraSmall) {
      return 0.5;
    }
    return 1;
  })();
  return (
    <div
      style={{
        cursor: notClickable === true ? "normal" : "pointer",
        zoom,
      }}
      onClick={() => {
        if (isBreedScreen && secondsUntilBreeding(kitty) > 0) {
          alert("Kitty is not ready to breed");
          return;
        }
        if (onClickKitty != null) {
          onClickKitty(kitty);
          return;
        }
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
      <CenterRow extraStyle={{ alignItems: "start" }}>
        <div style={{ marginRight: 20, marginTop: 100 }}>
          {availableActions?.map((action, i) => {
            return (
              <div key={i} style={{ paddingBottom: 10 }}>
                <KittyActionButton key={action} kitty={kitty} action={action} />
              </div>
            );
          })}
        </div>
        <CenterColumn>
          <CenterRow
            extraStyle={{
              border: `${borderStyle} white`,
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
              {isBreedScreen && <ReadyToBreedText kitty={kitty} />}
              <p style={idPStyle}>#{number} </p>
              <p style={minimalistPStyle}>{`(ID: ${id})`}</p>
              <KittyImg
                // TODO standardise naming
                base64={kitty.base64 ?? kitty.base_64}
                extraStyle={imgStyle}
              />
              <p
                style={{
                  fontSize: "1em",
                  marginBottom: 0,
                  textAlign: "center",
                }}
              >
                Gen: {gen}
              </p>
              {showPrice && !showFeatures && kitty.price != null && (
                <p style={idPStyle}>{`${kitty.price} KDA`}</p>
              )}
            </div>
          </CenterRow>
          {showParents && <KittyParents kitty={kitty} />}
          {/* Child kitties disabled for now */}
          {showFeatures && false && <KittyChildren kitty={kitty} />}
        </CenterColumn>
      </CenterRow>
    </div>
  );
}

function secondsUntilBreeding(kitty) {
  const readyTime = new Date(kitty.nextBreedTime * 1000);
  const now = new Date();
  const diffInS = Math.floor((readyTime - now) / 1000);
  return diffInS;
}

function ReadyToBreedText({ kitty }) {
  const diffInS = secondsUntilBreeding(kitty);
  const SECONDS_IN_HOUR = 60 * 60;
  if (diffInS <= 0) {
    return <p>Ready for Love</p>;
  }
  if (diffInS < SECONDS_IN_HOUR) {
    return <p>Wait {Math.floor(diffInS / 60)} Minutes</p>;
  }
  return <p>Wait {Math.floor(diffInS / SECONDS_IN_HOUR)} Hours</p>;
}

function navigateWithRefresh(screen) {
  const newUrl = window.location.origin + "/" + screen?.toLowerCase();
  if (newUrl !== window.location.href) {
    window.location.href = newUrl;
  } else {
    window.location.reload(true);
  }
}

function KittyActionButton({ kitty, action }) {
  const { allKittiesData } = useContext(GameContext);
  const { id } = kitty;
  const currKittyData = allKittiesData[idToIndex(id)];
  const buyKitty = useBuyKitty();
  const removeFromSale = useRemoveFromSale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (action === KITTY_ACTIONS.CAN_BUY) {
    return (
      <BasicActionButton
        onClick={() =>
          buyKitty(id, currKittyData.price, currKittyData.owner, () => {
            alert(`Bought kitty ${id}, page will refresh`);
            navigateWithRefresh(SCREENS.MY_KITTIES);
          })
        }
        text={`Buy for ${kitty.price} KDA`}
      />
    );
  } else if (action === KITTY_ACTIONS.PUT_ON_SALE) {
    return (
      <>
        <BasicActionButton
          onClick={() => setIsModalOpen(true)}
          text="Put on sale"
        />
        <PutOnSale
          isOpen={isModalOpen}
          close={() => setIsModalOpen(false)}
          id={id}
        />
      </>
    );
  } else if (action === KITTY_ACTIONS.REMOVE_FROM_SALE) {
    return (
      <BasicActionButton
        onClick={() =>
          removeFromSale(id, () => {
            alert(`Removed kitty ${id} from sale, page will refresh`);
            navigateWithRefresh(SCREENS.MY_KITTIES);
          })
        }
        text="Remove from sale"
      />
    );
  } else if (action === KITTY_ACTIONS.LOGIN_TO_BUY) {
    return (
      <BasicActionButton
        onClick={() => alert("Connect wallet using button on the left")}
        text="Login to buy"
      />
    );
  } else if (action === KITTY_ACTIONS.TRANSFER) {
    return (
      <>
        <BasicActionButton
          onClick={() => setIsModalOpen(true)}
          // onClick={() => putOnSale(id, 6.0)}
          text="Transfer"
        />
        <Transfer
          isOpen={isModalOpen}
          close={() => setIsModalOpen(false)}
          id={id}
        />
      </>
    );
  }
  return null;
}

function BasicActionButton({ onClick, text }) {
  return (
    <button
      className="btn btn-custom btn-sm"
      style={{ fontSize: 10, padding: "10 20" }}
      onClick={onClick}
    >
      {text}
    </button>
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
      <img
        alt="Kitty Guide"
        style={{ width: "100%" }}
        src="/img/kittykad.png"
      />
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
  justifyContent: "center",
  overflowY: "scroll",
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
