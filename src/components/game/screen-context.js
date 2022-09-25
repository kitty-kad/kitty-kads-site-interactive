import React, {
  useState,
  useContext,
  useMemo,
  createContext,
  useEffect,
} from "react";
import { PactContext } from "../../wallet/pact-wallet";

export const ScreenContext = createContext();

export function GameContextProvider({ children }) {
  const [currScreen, setCurrScreen] = useState(null);
  const [myKitties, setMyKitties] = useState(null);
  const [allKitties, setAllKitties] = useState(null);
  const [allIds, setAllIds] = useState(null);
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
      allKitties,
      setAllKitties,
      pricePerKitty,
      allIds,
      setAllIds,
      currKitty,
      setCurrKitty,
      lastScreen,
      calculateKittiesPrice: (amount) => {
        return Math.round(pricePerKitty * amount * 100) / 100;
      },
    };
  }, [
    currScreen,
    setCurrScreen,
    myKitties,
    setMyKitties,
    allKitties,
    setAllKitties,
    pricePerKitty,
    allIds,
    setAllIds,
    currKitty,
    setCurrKitty,
    lastScreen,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
