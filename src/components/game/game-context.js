import React, {
  useState,
  useContext,
  useMemo,
  createContext,
  useEffect,
} from "react";
import { PactContext } from "../../wallet/pact-wallet";

export const GameContext = createContext();

export function GameContextProvider({ children }) {
  const [searchParams, setSearchParams] = useState(null);
  const [currScreen, setCurrScreen] = useState(null);
  const [pagesInfo, setPagesInfo] = useState({ page: 0 });
  const [myKitties, setMyKitties] = useState(null);
  // Kitties data drops the 1: from the start
  const [allKittiesData, setAllKittiesData] = useState(null);
  const [currKitty, setCurrKitty] = useState(null);
  const { account } = useContext(PactContext);
  const [lastScreen, setLastScreen] = useState(null);
  const pricePerKitty = 5;

  // When the account is changed, reset the kitties saved
  useEffect(() => {
    setMyKitties(null);
    setCurrScreen(null);
  }, [account?.account]);

  const value = useMemo(() => {
    return {
      currScreen,
      setCurrScreen: (screen) => {
        setLastScreen(currScreen);
        setCurrScreen(screen);
      },
      myKitties,
      setMyKitties,
      allKittiesData,
      setAllKittiesData,
      pricePerKitty,
      currKitty,
      setCurrKitty,
      lastScreen,
      pagesInfo,
      setPagesInfo,
      searchParams,
      setSearchParams,
      calculateKittiesPrice: (amount) => {
        return Math.round(pricePerKitty * amount * 100) / 100;
      },
    };
  }, [
    currScreen,
    setCurrScreen,
    myKitties,
    setMyKitties,
    allKittiesData,
    setAllKittiesData,
    pricePerKitty,
    currKitty,
    setCurrKitty,
    lastScreen,
    pagesInfo,
    setPagesInfo,
    searchParams,
    setSearchParams,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
