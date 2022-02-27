import Pact from "pact-lang-api";
import { useContext, useCallback } from "react";
import { PactContext } from "../../wallet/pact-wallet";
import { GameContext } from "./game-context";

const KITTY_KADS_CONTRACT = "kitty-kad-kitties";
const ADOPT_FUNC = "adopt-gen-0s-bulk";
const OWNED_BY_FUNC = "kitties-owned-by";
const ALL_IDS_FUNC = "all-kitties";
const ADMIN_ADDRESS =
  "k:fd91af358418e2c8e50a501451a41de49af01f45e34bc4f1735cab293084f7ea";

function useGetMyKitties() {
  const { account, readFromContract, defaultMeta } = useContext(PactContext);

  return async () => {
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${OWNED_BY_FUNC} "${account.account}")`;
    const meta = defaultMeta();
    return await readFromContract({ pactCode, meta });
  };
}

function useGetAllKitties() {
  const { readFromContract, defaultMeta } = useContext(PactContext);

  return async () => {
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${ALL_IDS_FUNC})`;
    const meta = defaultMeta();
    return await readFromContract({ pactCode, meta });
  };
}

function useAdoptKitties() {
  const { account, gasPrice, chainId, netId, sendTransaction } =
    useContext(PactContext);
  const { pricePerKitty } = useContext(GameContext);
  return (amount, callback) => {
    const priceToPay = amount * pricePerKitty;
    const kittyKadsAmount = `${amount} Kitty Kad${amount === 1 ? "" : "s"}`;
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${ADOPT_FUNC} "${account.account}" ${amount})`;
    const cmd = {
      pactCode,
      caps: [
        Pact.lang.mkCap(`Pay to adopt`, "Pay to adopt", `coin.TRANSFER`, [
          account.account,
          ADMIN_ADDRESS,
          priceToPay,
        ]),
        Pact.lang.mkCap(
          "Verify your account",
          "Verify your account",
          `free.${KITTY_KADS_CONTRACT}.ACCOUNT_GUARD`,
          [account.account]
        ),
        Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      ],
      sender: account.account,
      gasLimit: 3000 * amount,
      gasPrice,
      chainId,
      ttl: 600,
      envData: {
        "user-ks": account.guard,
        account: account.account,
      },
      signingPubKey: account.guard.keys[0],
      networkId: netId,
    };
    const previewContent = (
      <p>
        You will adopt {kittyKadsAmount} for {priceToPay} KDA
      </p>
    );
    sendTransaction(
      cmd,
      previewContent,
      `adopting ${kittyKadsAmount}`,
      callback ?? (() => alert("adopted!"))
    );
  };
}

export { useGetMyKitties, useGetAllKitties, useAdoptKitties };
