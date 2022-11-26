import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import { useTransfer } from "../../pact-functions";
import { PactContext } from "../../../../wallet/pact-wallet";

export default function Transfer(props) {
  const transfer = useTransfer();
  const { fetchAccountDetails } = useContext(PactContext);

  const [receiver, setReceiver] = useState("");

  const { isOpen, close, id } = props;
  if (!isOpen) {
    return null;
  }
  return (
    <Modal
      open={props.isOpen}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div style={{ paddingBottom: 10 }}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {`Send ${id} to another user`}
          </Typography>
          <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
            K: account of receiver (must be on chain 1 and have balance)
          </Typography>
        </div>
        <div>
          <TextField
            id="outlined-basic"
            type="text"
            label="To k: account"
            style={{ width: "100%" }}
            variant="outlined"
            value={receiver}
            onChange={(e) => {
              setReceiver(e.target.value);
            }}
          />
        </div>
        <div style={{ paddingTop: 20 }}>
          <span style={{ paddingRight: 20 }}>
            <Button
              disabled={!receiver.includes("k:")}
              variant="contained"
              color="success"
              onClick={async () => {
                const newAccount = await fetchAccountDetails(receiver);
                if (newAccount == null) {
                  alert(
                    `Account ${receiver} doesn't exist/have balance on chain 1`
                  );
                  return;
                }
                transfer(id, receiver);
                close();
              }}
              style={{ paddingRight: 20 }}
            >
              Transfer
            </Button>
          </span>
          <Button variant="contained" color="error" onClick={close}>
            Cancel
          </Button>
        </div>
      </Box>
    </Modal>
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
