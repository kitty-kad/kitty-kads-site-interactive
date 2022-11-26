import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { usePutOnSale } from "../../pact-functions";

export default function PutOnSale(props) {
  const putOnSale = usePutOnSale();
  const [price, setPrice] = useState(0);

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
            {`Put ${id} for sale`}
          </Typography>
          <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
            {`How much would you like to sell it for?`}
          </Typography>
        </div>
        <div>
          <TextField
            id="outlined-basic"
            type="number"
            label="Price"
            variant="outlined"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
            }}
          />
        </div>
        <div style={{ paddingTop: 20 }}>
          <span style={{ paddingRight: 20 }}>
            <Button
              disabled={price <= 0}
              variant="contained"
              color="success"
              onClick={() => {
                putOnSale(id, parseFloat(price));
                close();
              }}
              style={{ paddingRight: 20 }}
            >
              Put on sale
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
