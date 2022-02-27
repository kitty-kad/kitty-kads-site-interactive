import React, {
  useState,
  useContext,
  useMemo,
  createContext,
  useEffect,
} from "react";
import { PactContext } from "../../wallet/pact-wallet";
import { SCREENS } from "./consts";

export const GameContext = createContext();

export function GameContextProvider({ children }) {
  const [currScreen, setCurrScreen] = useState(null);
  const [myKitties, setMyKitties] = useState(null);
  const [allKitties, setAllKitties] = useState(null);
  const { account } = useContext(PactContext);
  const pricePerKitty = 1;

  // When the account is changed, reset the kitties saved
  useEffect(() => {
    setMyKitties(null);
    setCurrScreen(null);
  }, [account?.account]);

  const value = useMemo(() => {
    return {
      currScreen,
      setCurrScreen,
      myKitties,
      setMyKitties,
      allKitties,
      setAllKitties,
      pricePerKitty,
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
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
