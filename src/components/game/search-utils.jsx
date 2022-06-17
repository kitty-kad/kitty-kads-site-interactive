import React, { useContext, useState, useEffect } from "react";

import { CenterRow, textFontFamily } from "./screens/screen-container";
export function Search({ onSearch }) {
  const [id, setId] = useState(null);
  return (
    <CenterRow extraStyle={{ paddingBottom: "10px" }}>
      <div style={{ paddingRight: "20px" }}>
        <input
          style={{
            borderRadius: 5,
            border: "none",
            textAlign: "center",
            height: "2em",
          }}
          value={id ?? ""}
          placeholder="Type number..."
          defaultValue="test"
          type="number"
          onChange={(e) => {
            console.log(e?.target?.value);
            setId(e?.target?.value);
          }}
        />
      </div>
      <div style={{ paddingRight: "20px" }}>
        <BasicButton text="Find kitty" onClick={() => onSearch({ id })} />
      </div>
      {id != null && (
        <BasicButton
          type="reset"
          text="Reset"
          onClick={() => {
            setId(null);
            onSearch(null);
          }}
        />
      )}
    </CenterRow>
  );
}

export function BasicButton({ text, onClick, disabled, type }) {
  let background = "#249946";
  if (disabled) {
    background = "gray";
  } else if (type === "reset") {
    background = "rgb(88, 178, 238)";
  }
  return (
    <button
      disabled={false}
      style={{
        // width: '',
        fontFamily: textFontFamily,
        fontSize: "16px",
        lineHeight: "30px",
        color: "white",
        background,
        border: type !== "reset" ? "none" : "1px solid white",
        borderRadius: 5,
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
