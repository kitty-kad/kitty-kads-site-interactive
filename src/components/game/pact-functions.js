import Pact from "pact-lang-api";
import { useCallback } from "react";
import { useContext, useState } from "react";
import { PactContext } from "../../wallet/pact-wallet";

const KITTY_KADS_CONTRACT = "kitty-kad-kitties";
const GEN_1_CONTRACT = "gen-1-kitty-kad-kitties";

const OWNED_BY_FUNC = "ids-owned-by";
const BREED_GEN_1_FUNC = "mint-kitty";
const ALL_IDS_FUNC = "all-ids";
const ALL_ON_SALE_FUNCTION = "get-all-on-sale";
const MARKET_PLACE_FIELDS_FOR_ID = "get-marketplace-fields-for-id";
const MARKET_PLACE_FIELDS_FOR_IDS = "get-marketplace-fields-for-ids";
const IDS_OF_CHILDREN = "ids-of-children ";
const NFT_FIELDS_FOR_ID = "get-nft-fields-for-id";
const BUY_ID_ON_SALE_FUNC = "buy-id-on-sale";
const PUT_ID_ON_SALE_FUNC = "put-id-for-sale";
const REMOVE_ID_ON_SALE_FUNC = "remove-id-from-sale";
const TRANSFER_FUNC = "transfer";

// const WL_ROLE_FUNC = "enforce-adopt-wl-role";
// export const ADMIN_ADDRESS =
//   "k:fd91af358418e2c8e50a501451a41de49af01f45e34bc4f1735cab293084f7ea";
export const ADMIN_ADDRESS =
  "k:f7278eeaa55a4b52c281fa694035f82a43a6711eb547fc1ab900be1ccf9fb409";

function useGetMyKitties() {
  const { account, readFromContract, defaultMeta } = useContext(PactContext);

  const [getMyKitties] = useState(() => async () => {
    const pactCodeGen0 = `(free.${KITTY_KADS_CONTRACT}.${OWNED_BY_FUNC} "${account.account}")`;
    const pactCodeGen1 = `(free.${GEN_1_CONTRACT}.${OWNED_BY_FUNC} "${account.account}")`;
    const meta = defaultMeta(1000000);
    const [myGen0s, myGen1s] = await Promise.all([
      readFromContract({ pactCode: pactCodeGen0, meta }),
      readFromContract({ pactCode: pactCodeGen1, meta }),
    ]);
    return [...myGen0s, ...myGen1s];
  });
  return getMyKitties;
}

function useGetAllKitties() {
  const { readFromContract, defaultMeta } = useContext(PactContext);

  const [getAllKitties] = useState(() => async () => {
    const pactCodeGen0 = `(free.${KITTY_KADS_CONTRACT}.${ALL_IDS_FUNC})`;
    const pactCodeGen1 = `(free.${GEN_1_CONTRACT}.${ALL_IDS_FUNC})`;
    const meta = defaultMeta();
    const [gen0Ids, gen1Ids] = await Promise.all([
      readFromContract({ pactCode: pactCodeGen0, meta }),
      readFromContract({ pactCode: pactCodeGen1, meta }),
    ]);
    return [...gen0Ids, ...gen1Ids];
  });
  return getAllKitties;
}

function useGetKittiesOnSale() {
  const { readFromContract, defaultMeta } = useContext(PactContext);
  const getAllOnSale = useCallback(async () => {
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${ALL_ON_SALE_FUNCTION})`;
    const meta = defaultMeta();
    return await readFromContract({ pactCode, meta });
  }, [defaultMeta, readFromContract]);
  return getAllOnSale;
}

function useGetPricesForKitties() {
  const { readFromContract, defaultMeta } = useContext(PactContext);
  const getPricesForKitties = useCallback(
    async (ids) => {
      const pactCode = `(free.${KITTY_KADS_CONTRACT}.${MARKET_PLACE_FIELDS_FOR_IDS} ["price"] ${JSON.stringify(
        ids
      )})`;
      const meta = defaultMeta();
      return await readFromContract({ pactCode, meta });
    },
    [defaultMeta, readFromContract]
  );
  return getPricesForKitties;
}

function useGetChildrenForKitty() {
  const { readFromContract, defaultMeta } = useContext(PactContext);
  const getChildrenForKitty = useCallback(
    async (parentId) => {
      const pactCode = `(free.${GEN_1_CONTRACT}.${IDS_OF_CHILDREN} "${parentId}")`;
      const meta = defaultMeta();
      const resp = await readFromContract({ pactCode, meta });
      return resp.map((idDict) => idDict.id);
    },
    [defaultMeta, readFromContract]
  );
  return getChildrenForKitty;
}

function useGetKittyActions() {
  const { readFromContract, defaultMeta } = useContext(PactContext);
  const getAllOnSale = useCallback(
    async (id) => {
      const contract = id.includes(":") ? KITTY_KADS_CONTRACT : GEN_1_CONTRACT;
      const pactCodeNft = `(free.${contract}.${NFT_FIELDS_FOR_ID} ["owner"] "${id}")`;
      const pactCodeMarket = `(free.${contract}.${MARKET_PLACE_FIELDS_FOR_ID} ["for-sale", "owner", "price"] "${id}")`;

      const meta = defaultMeta();
      const [nftData, marketData] = await Promise.all([
        readFromContract({ pactCode: pactCodeNft, meta }),
        readFromContract({ pactCode: pactCodeMarket, meta }, null, true),
      ]);
      return { nftData, marketData };
    },
    [defaultMeta, readFromContract]
  );
  return getAllOnSale;
}

function getPriceString(price) {
  const jsonStr = JSON.stringify(price);
  if (jsonStr.includes(".")) {
    return jsonStr;
  }
  return jsonStr + ".0";
}

function useGetFeeAndToSeller() {
  const { readFromContract, defaultMeta } = useContext(PactContext);
  return async (priceAsString) => {
    const pactCodeMarketFee = `(free.${KITTY_KADS_CONTRACT}.get-market-fee-from-price ${priceAsString})`;
    const pactCodeSellerAmount = `(free.${KITTY_KADS_CONTRACT}.get-to-seller-amount-from-price ${priceAsString})`;
    const meta = defaultMeta();

    const [fee, toSeller] = await Promise.all([
      readFromContract({ pactCode: pactCodeMarketFee, meta }),
      readFromContract({ pactCode: pactCodeSellerAmount, meta }),
    ]);
    return { fee, toSeller };
  };
}

function useBuyKitty() {
  const { account, gasPrice, chainId, netId, sendTransaction } =
    useContext(PactContext);
  const getFeeAndToSeller = useGetFeeAndToSeller();
  return async (id, price, sellerAddress, callback) => {
    const priceAsString = getPriceString(price);
    const { fee, toSeller } = await getFeeAndToSeller(priceAsString);
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${BUY_ID_ON_SALE_FUNC} "${id}" "${account.account}")`;

    const cmd = {
      pactCode,
      caps: [
        ...buyFeesCaps(account, sellerAddress, toSeller, fee),
        ...accountGuardCap(account),
        gasCap(),
      ],
      sender: account.account,
      gasLimit: 10000,
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
        You will buy {id} for {price} KDA
      </p>
    );
    sendTransaction(
      cmd,
      previewContent,
      `buying ${id}`,
      callback ?? (() => alert(`bought ${id}!`))
    );
  };
}

function gasCap() {
  return Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []);
}

function usePutOnSale() {
  const { account, gasPrice, chainId, netId, sendTransaction } =
    useContext(PactContext);
  return async (id, price, callback) => {
    const priceAsString = getPriceString(price);
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${PUT_ID_ON_SALE_FUNC} "${id}" ${priceAsString})`;

    const cmd = {
      pactCode,
      caps: [...ownerCaps(account), gasCap()],
      sender: account.account,
      gasLimit: 10000,
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
        You will put {id} on sale for {price} KDA
      </p>
    );
    sendTransaction(
      cmd,
      previewContent,
      `putting ${id} for sale at ${price} KDA`,
      callback ?? (() => alert(`put ${id} for sale at ${price} KDA`))
    );
  };
}

function useTransfer() {
  const { account, gasPrice, chainId, netId, sendTransaction } =
    useContext(PactContext);
  return async (id, receiver, callback) => {
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${TRANSFER_FUNC} "${id}" "${account.account}" "${receiver}" 1.0)`;
    const cmd = {
      pactCode,
      caps: [...ownerCaps(account), gasCap()],
      sender: account.account,
      gasLimit: 10000,
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
      <p
        style={{
          maxWidth: "100%",
          wordWrap: "break-word",
          display: "inline-block",
        }}
      >
        You will send kitty {id} to {receiver}
      </p>
    );
    sendTransaction(
      cmd,
      previewContent,
      `sending ${id} to ${receiver.substring(0, 10)}`,
      callback ?? (() => alert(`sent ${id} to ${receiver.substring(0, 10)}`))
    );
  };
}

function useRemoveFromSale() {
  const { account, sendTransaction } = useContext(PactContext);
  const makeCmd = useCmd();
  return async (id, callback) => {
    const pactCode = `(free.${KITTY_KADS_CONTRACT}.${REMOVE_ID_ON_SALE_FUNC} "${id}")`;
    const cmd = makeCmd(pactCode, [...ownerCaps(account), gasCap()]);
    const previewContent = <p>You will remove {id} from sale</p>;
    sendTransaction(
      cmd,
      previewContent,
      `remove ${id} from sale`,
      callback ?? (() => alert(`removed ${id} from sale`))
    );
  };
}

function useBreedKitties() {
  const { account, sendTransaction } = useContext(PactContext);
  const makeCmd = useCmd();
  return async (id1, id2, callback) => {
    const pactCode = `(free.${GEN_1_CONTRACT}.${BREED_GEN_1_FUNC} "${id1}" "${id2}" "${account.account}")`;
    const cmd = makeCmd(pactCode, [
      ...ownerCaps(account),
      gasCap(),
      marketplaceCap(account, 1.0),
    ]);
    const previewContent = (
      <p>
        You will breed kitties with {id1} and {id2} together for 1 KDA
      </p>
    );
    sendTransaction(
      cmd,
      previewContent,
      `Bred kitties ${id1} and ${id2}`,
      callback ?? (() => alert(`Bred kitties ${id1} and ${id2}`))
    );
  };
}

function useCmd() {
  const { account, gasPrice, chainId, netId } = useContext(PactContext);
  return (pactCode, caps) => ({
    pactCode,
    caps,
    sender: account.account,
    gasLimit: 10000,
    gasPrice,
    chainId,
    ttl: 600,
    envData: {
      "user-ks": account.guard,
      account: account.account,
    },
    signingPubKey: account.guard.keys[0],
    networkId: netId,
  });
}

function ownerCaps(account) {
  return [
    Pact.lang.mkCap(
      "Verify you are the owner",
      "Verify you are the owner",
      `free.${KITTY_KADS_CONTRACT}.OWNER`,
      [account.account]
    ),
    Pact.lang.mkCap(
      "Verify you are the owner",
      "Verify you are the owner",
      `free.${GEN_1_CONTRACT}.OWNER`,
      [account.account]
    ),
    ...accountGuardCap(account),
  ];
}

function accountGuardCap(account) {
  return [
    Pact.lang.mkCap(
      "Verify your account",
      "Verify your account",
      `free.${KITTY_KADS_CONTRACT}.ACCOUNT_GUARD`,
      [account.account]
    ),
    Pact.lang.mkCap(
      "Verify your account",
      "Verify your account",
      `free.${GEN_1_CONTRACT}.ACCOUNT_GUARD`,
      [account.account]
    ),
  ];
}

function buyFeesCaps(account, sellerAddress, toSeller, fee) {
  return [
    Pact.lang.mkCap(
      `Amount to seller`,
      "What the seller will receive",
      `coin.TRANSFER`,
      [account.account, sellerAddress, toSeller]
    ),
    marketplaceCap(account, fee),
  ];
}

function marketplaceCap(account, ammount) {
  return Pact.lang.mkCap(
    `Marketplace fee`,
    "Included in total price",
    `coin.TRANSFER`,
    [account.account, ADMIN_ADDRESS, ammount]
  );
}

export {
  useGetMyKitties,
  useGetAllKitties,
  useGetKittiesOnSale,
  useGetKittyActions,
  useGetPricesForKitties,
  useBuyKitty,
  usePutOnSale,
  useRemoveFromSale,
  useTransfer,
  useBreedKitties,
  useGetChildrenForKitty,
};
