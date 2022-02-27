import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useContext } from "react";
import { PactContext } from "./pact-wallet";

export default function TransactionModal(_props) {
  const pactContext = useContext(PactContext);
  const modalContent = getTitleBodyAction(pactContext);
  const open = modalContent != null;
  if (open === false) {
    return null;
  }
  return (
    <Modal
      open={open}
      onClose={() => {}}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <BaseContent {...modalContent} />
        {modalContent.action && (
          <div style={{ paddingTop: 20 }}>
            <span style={{ paddingRight: 20 }}>
              <Button
                variant="contained"
                color="success"
                onClick={modalContent.action}
                style={{ paddingRight: 20 }}
              >
                {modalContent.buttonText}
              </Button>
            </span>
            <Button
              variant="contained"
              color="error"
              onClick={pactContext.clearTransaction}
            >
              Cancel
            </Button>
          </div>
        )}
      </Box>
    </Modal>
  );
}

function getTitleBodyAction(pactContext) {
  const transactionState = pactContext.currTransactionState;
  if (transactionState == null) {
    return null;
  }
  let title = null;
  let body = null;
  let buttonText = null;
  let action = null;
  if (transactionState.cmdToConfirm != null) {
    title = "Review Transaction";
    buttonText = "Open Wallet";
    action = async () =>
      pactContext.signTransaction(transactionState.cmdToConfirm);
    body = transactionState.previewComponent;
  } else if (transactionState.signingCmd != null) {
    title = "Signing transaction";
    body = "Check you wallet to sign the transaction";
  } else if (transactionState.signedCmd != null) {
    title = "Submitting the transaction";
  } else {
    return null;
  }
  return { title, body, buttonText, action };
}

function BaseContent({ title, body }) {
  return (
    <div>
      <Typography id="modal-modal-title" variant="h5" component="h2">
        {title}
      </Typography>
      <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
        {body}
      </Typography>
    </div>
  );
}

const style = {
  position: "absolute",
  borderRadius: 5,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
