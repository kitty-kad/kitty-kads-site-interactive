import React, { useContext, useState, useEffect } from "react";
import { Header, Modal, Menu, Icon, Message } from "semantic-ui-react";
import styled from "styled-components/macro";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import { PactContext } from "../../contexts/PactContext";
import theme from "../../styles/theme";
import Checkbox from "../../components/shared/Checkbox";
import { ReactComponent as LockIcon } from "../../assets/images/shared/lock.svg";
import { ReactComponent as UnlockIcon } from "../../assets/images/shared/unlock.svg";
import getAccounts from "../../utils/getZelcoreAccts";
import swal from "@sweetalert/with-react";
import walletAccts from "../../components/alerts/walletAccts";
import walletError from "../../components/alerts/walletError";
import selectAcct from "../../components/alerts/selectAcct";
import "../../styles/inputoverride.css";

export default function Account(props) {
  const pact = useContext(PactContext);
  const [acct, setAcct] = useState(
    pact.account.account ? pact.account.account : ""
  );
  const [locked, setLocked] = useState(
    pact.account.account && pact.hasWallet() ? true : false
  );
  const [method, setMethod] = useState(pact.signing.method);
  const pk = "";
  const pw = "";
  const [pwConf, setPwConf] = useState("");
  const [temp, setTemp] = useState("");
  const [zelAcct, setZelAcct] = useState();
  const [loading, setLoading] = useState(false);

  const is_hexadecimal = (str) => {
    const regexp = /^[0-9a-fA-F]+$/;
    if (regexp.test(str)) return true;
    else return false;
  };

  const checkKey = (key) => {
    try {
      if (key.length !== 64) {
        return false;
      } else if (!is_hexadecimal(key)) {
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const canSubmit = () => {
    if (method === "sign") return true;
    if (method === "pk" && checkKey(pk)) return true;
    if (method === "pk+pw" && pw === pwConf && checkKey(pk) && pw !== "")
      return true;
    return false;
  };

  const resetValues = () => {
    setLocked(false);
    setPwConf("");
    setLocked(true);
  };

  return (
    <Modal
      onClose={() => {
        pact.setRegistered(true);
        resetValues();
        props.onClose();
      }}
      open={props.open}
    >
      <div className="content">
        <div className="account-grid">
          <div>
            <span className="medium-text">Connect to a wallet (Chain 3)</span>
          </div>
          <div>
            <Input
              placeholder="Enter Account"
              error={pact.account.account === null && temp !== ""}
              containerStyle={{ marginBottom: 10 }}
              value={acct}
              onChange={async (e, { value }) => {
                setAcct(value);
                setTemp(value);
                await pact.setVerifiedAccount(value);
              }}
            />

            <div
              onClick={async () => {
                setLoading(true);
                walletAccts();
                const accts = await getAccounts();
                swal.close();
                if (accts.status === "success") {
                  setAcct(accts.data[0]);
                  setTemp(accts.data[0]);
                  await pact.setVerifiedAccount(accts.data[0]);
                  await selectAcct(
                    accts.data,
                    setAcct,
                    setTemp,
                    pact.setVerifiedAccount
                  );
                } else {
                  walletError();
                }
                setLoading(false);
              }}
              loading={loading}
              className="sub-button"
            >
              Get zelcore accounts
            </div>
          </div>

          <span className="medium-text">Account Details</span>

          {pact.account.account ? (
            <>
              <div color="purple">
                <div className="account-details-box">
                  <span>{JSON.stringify(pact.account.guard, null, "\t")}</span>
                </div>
              </div>
            </>
          ) : temp === "" ? (
            <></>
          ) : (
            <div>
              <span className="medium-text">
                Account Does Not Exist (Send KDA to Chain 3)
              </span>
            </div>
          )}
          <div
            style={{
              opacity: pact?.account?.account ? 1 : 0.3,
            }}
          >
            <div>
              <span className="medium-text">Signing Method</span>
              <Menu color="purple" widths={1}>
                <Menu.Item
                  name="sign"
                  active={method === "sign"}
                  onClick={() => setMethod("sign")}
                  disabled={locked}
                >
                  <Icon name="signup" />
                  Chainweaver / Zelcore Signing
                </Menu.Item>
              </Menu>
            </div>
          </div>
          <div className="account-details-box">
            <span
              style={{
                color: "#1f1f1f",
                fontSize: 16,
              }}
            >
              <Icon name="warning sign" /> Note
            </span>
            <span>
              Please make sure the KDA account provided is controlled by your
              wallet. When submitting a transaction, You will see a preview
              within the wallet before signing.
            </span>
            <div className="account-button-box">
              <div
                className="wallet-button"
                onClick={() => window.open("https://zelcore.io", "_blank")}
              >
                Download Zelcore
              </div>

              <div
                className="wallet-button"
                onClick={() =>
                  window.open(
                    "https://kadena-1.gitbook.io/welcome-to-gitbook/chainweaver-user-guide",
                    "_blank"
                  )
                }
              >
                Download Chainweaver
              </div>
            </div>
          </div>
        </div>
        <div className="divider" style={{ margin: "1rem 0" }}></div>
        <div className="account-button-grid">
          <span
            className="sub-button"
            onClick={() => {
              resetValues();
              props.onClose();
            }}
          >
            Cancel
          </span>
          <Button
            onClick={async () => {
              if (method === "pk") await pact.storePrivKey(pk);
              if (method === "pk+pw") await pact.encryptKey(pk, pw);
              if (method === "sign") await pact.signingWallet();
              resetValues();
              props.onClose();
            }}
            buttonStyle={{ padding: "10px 50px" }}
            disabled={!canSubmit()}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
