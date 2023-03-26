import React, { useState, useMemo, createContext, useEffect } from "react";
import { SCREENS } from "./consts";

export const GameContext = createContext();

export function GameContextProvider({ children }) {
  const [searchParams, setSearchParams] = useState(null);
  const [allKittiesOnSale, setAllKittiesOnSale] = useState(null);
  const [currScreen, setCurrScreen] = useState(() => {
    const screen = window.location.pathname?.replace("/", "")?.toUpperCase();
    // Details screen is not supported yet
    if (screen.includes(SCREENS.DETAILS)) {
      window.history.pushState("", "", "/");
      return null;
    }
    return screen != null ? SCREENS[screen] : null;
  });
  const [pagesInfo, setPagesInfo] = useState({});
  const [myKitties, setMyKitties] = useState(null);
  // Kitties data drops the 1: from the start
  const [allKittiesData, setAllKittiesData] = useState([]);
  // const [allKittiesData, setAllKittiesData] = useState(() => {
  //   const arr = [];
  //   for (let i = 0; i < 10000; i++) {
  //     arr.push({ id: `1:${i}` });
  //   }
  //   return arr;
  // });
  const [currKitty, setCurrKitty] = useState(null);
  const [lastScreen, setLastScreen] = useState(null);
  const pricePerKitty = 5;
  useEffect(() => {}, []);

  const value = useMemo(() => {
    return {
      currScreen,
      setCurrScreen: (screen) => {
        setLastScreen(currScreen);
        setCurrScreen(screen);
        window.history.pushState(screen, screen, `/${screen.toLowerCase()}`);
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
      allKittiesOnSale,
      setAllKittiesOnSale,
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
    allKittiesOnSale,
    setAllKittiesOnSale,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
