import lodash from "lodash";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
// import { throttle } from "throttle-debounce";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import FEATURES_JSON from "./features.json";

import {
  CenterColumn,
  CenterRow,
  textFontFamily,
} from "./screens/screen-container";
import { useCallback } from "react";

function getFiltersFromSearchParams(searchParams) {
  if (searchParams?.filters == null) {
    return {};
  }
  const filters = {};
  searchParams.forEach((param) => {
    filters[param.templateType] = param;
  });
  return filters;
}

export function SearchFilters({
  searchParams,
  setSearchParams,
  gen,
  gen0Override,
  setGen0Ovveride,
}) {
  const [filters, setFilters] = useState(() =>
    getFiltersFromSearchParams(searchParams)
  );

  const onFilterChanged = useCallback(
    (filter, optionalExtraValue) => {
      const genToUse = gen ?? gen0Override;
      if (filter === "RESET") {
        setFilters({});
        setSearchParams({}, genToUse);
      } else if (filter === "CLEAR" && optionalExtraValue != null) {
        const withoutFilter = { ...filters };
        delete withoutFilter[optionalExtraValue];
        setFilters(withoutFilter);
      } else if (filter === "SEARCH") {
        const parsedFilters = [];
        Object.entries(filters).forEach(([_, values]) => {
          parsedFilters.push(values);
        });
        setSearchParams({ filters: parsedFilters }, genToUse);
      } else if (filter === "NUMBER") {
        const num = parseInt(optionalExtraValue);
        if (num === "NaN") {
          alert("Invalid number to search by");
          return;
        }
        if (genToUse === 0 && num > 10000) {
          alert("Only 10,000 Gen 0 kitties exist");
        }
        if ((genToUse === 1) & (num > 5000)) {
          alert("Only 5,000 Gen 1 kitties exist");
        }
        setFilters({ num: genToUse === 0 ? num : num + 9999, genToUse });
        setSearchParams(
          {
            id: genToUse === 0 ? `1:${num - 1}` : num.toString(),
          },
          genToUse
        );
      } else {
        setFilters({ ...filters, ...filter });
      }
    },
    [filters, setFilters, setSearchParams, gen, gen0Override]
  );

  return (
    <ConfigureFiltersButton
      filters={filters}
      onFilterChanged={onFilterChanged}
      gen0Override={gen0Override}
      setGen0Ovveride={setGen0Ovveride}
    />
  );
}

function GenText({ gen }) {
  return (
    <p style={{ margin: 0, fontSize: 14, textTransform: "uppercase" }}>
      {gen === 0 ? "Gen 0" : "Gen 1"}
    </p>
  );
}

function ConfigureFiltersButton({
  filters,
  onFilterChanged,
  gen0Override,
  setGen0Ovveride,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <CenterRow>
        {gen0Override != null && (
          <>
            <GenText gen={0} />
            <Switch
              checked={gen0Override === 1} // relevant state for your case
              onChange={(_, checked) => setGen0Ovveride(checked ? 1 : 0)} // relevant method to handle your change
            />
            <GenText gen={1} />
            <div style={{ marginRight: 20 }} />
          </>
        )}
        <button
          className="btn btn-custom btn-sm"
          style={{ fontSize: 12 }}
          onClick={() => setIsModalOpen(true)}
        >
          Filter
        </button>
        <FiltersModal
          isOpen={isModalOpen}
          closeModal={() => {
            setIsModalOpen(false);
          }}
          filters={filters}
          onFilterChanged={onFilterChanged}
        />
      </CenterRow>
    </div>
  );
}

function checkHasFilters(filters) {
  return filters != null && Object.entries(filters) > 0;
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

function FiltersModal({
  isOpen,
  closeModal,
  filters,
  onFilterChanged,
  features,
}) {
  const [searchByNumber, setSearchByNumber] = useState(filters?.num != null);
  const [numberValue, setNumberValue] = useState(filters?.num);
  const onSearchByNumberChange = useCallback(
    (newVal) => {
      const isChecked = newVal?.target?.checked;
      setSearchByNumber(isChecked);
      onFilterChanged("RESET");
    },
    [onFilterChanged, setSearchByNumber]
  );
  return (
    <Modal
      open={isOpen}
      onClose={() => {
        closeModal();
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          style={paddingStyle}
          id="modal-modal-title"
          variant="h5"
          component="h2"
        >
          Select Filters
        </Typography>
        {searchByNumber && (
          <>
            <TextField
              style={{ ...paddingStyle, width: "100%" }}
              id="kitty-kad-number"
              label="Kitty Kad #"
              onChange={(e) => setNumberValue(e.target.value)}
              variant="outlined"
              defaultValue={numberValue ?? ""}
            />
            <Typography
              style={paddingStyle}
              id="modal-modal-description"
              variant="h6"
              sx={{ mt: 2 }}
            >
              {"Test"}
            </Typography>
          </>
        )}
        {!searchByNumber && (
          <div
            style={{
              display: "flex",
              overflowY: "scroll",
              height: "70vh",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {Object.entries(FEATURES_JSON).map(([key, value]) => (
              <FeatureSelector
                key={key}
                templateType={key}
                templates={value}
                onFilterChanged={onFilterChanged}
                filters={filters}
              />
            ))}
          </div>
        )}
        <FormControlLabel
          style={{ width: "100%" }}
          control={<Switch checked={searchByNumber} />}
          onChange={onSearchByNumberChange}
          label="Search by exact #"
        />
        <div style={{ paddingTop: 60 }}>
          <span style={{ paddingRight: 20 }}>
            <Button
              disabled={false}
              variant="contained"
              color="success"
              onClick={() => {
                if (searchByNumber) {
                  onFilterChanged("NUMBER", numberValue);
                } else {
                  onFilterChanged("SEARCH");
                }
                closeModal();
              }}
              style={{ paddingRight: 20 }}
            >
              Search
            </Button>
          </span>
          <span style={{ paddingRight: 20 }}>
            <Button variant="contained" onClick={closeModal}>
              Close
            </Button>
          </span>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              closeModal();
              onFilterChanged("RESET");
            }}
          >
            RESET
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

function filtersContainTemplateId(filters, templateType) {
  return filters[templateType]?.templateId;
}

function filtersContainSubfeature(filters, templateType) {
  const features = filters[templateType]?.features;
  return features?.length === 1 ? features[0] : null;
}

function FeatureSelector({
  templateType,
  templates,
  onFilterChanged,
  filters,
}) {
  const id = `${templateType}-simple-select-label`;
  const [selectedTemplatedId, setSelectedTemplatedId] = useState(() =>
    filtersContainTemplateId(filters, templateType)
  );
  const [selectedSubFeature, setSelectedSubFeature] = useState(() =>
    filtersContainSubfeature(filters, templateType)
  );

  const subFeatures = templates[selectedTemplatedId];
  const subFeatureId = `${selectedTemplatedId}-sub-feature-simple-select-label`;

  const onFilterValueChanged = (templateId, subFeature, extraCommand) => {
    if (extraCommand === "CLEAR") {
      setSelectedTemplatedId(null);
      setSelectedSubFeature(null);
      onFilterChanged("CLEAR", templateType);
      return;
    }
    if (templateId !== selectedTemplatedId) {
      setSelectedTemplatedId(templateId);
      setSelectedSubFeature(null);
    } else if (subFeature !== selectedSubFeature) {
      setSelectedSubFeature(subFeature);
    }
    if (templateId == null) {
      return {};
    }
    const val = {
      [templateType]: {
        templateType,
        templateId,
      },
    };
    if (subFeature != null) {
      val[templateType].features = [subFeature];
    }
    onFilterChanged(val);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
      }}
    >
      <CenterColumn extraStyle={{ width: 20, cursor: "pointer" }}>
        {(selectedTemplatedId != null || selectedSubFeature != null) && (
          <p onClick={() => onFilterValueChanged(null, null, "CLEAR")}>❌</p>
        )}
      </CenterColumn>
      <FormControl style={{ width: 100 }}>
        <InputLabel id={id}>{formatFeature(templateType)}</InputLabel>
        <Select
          style={{ marginBottom: 10 }}
          labelId={id}
          id={`${templateType}-simple-select`}
          value={selectedTemplatedId ?? ""}
          label={templateType}
          onChange={(e) => {
            onFilterValueChanged(e.target.value, selectedSubFeature);
          }}
        >
          {Object.entries(templates).map(([key]) => (
            <MenuItem key={key} value={key}>
              {formatFeature(key)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div style={{ width: 200 }}>
        {subFeatures != null && subFeatures.length > 0 ? (
          <FormControl style={{ width: "100%" }}>
            <InputLabel id={subFeatureId}>Sub-Feature</InputLabel>
            <Select
              style={{ marginLeft: 10 }}
              labelId={subFeatureId}
              id={`${subFeatureId}-sub-feature-simple-select`}
              value={selectedSubFeature ?? ""}
              label="Sub-Feature"
              onChange={(e) => {
                onFilterValueChanged(selectedTemplatedId, e.target.value);
              }}
            >
              {subFeatures.map((key) => (
                <MenuItem key={key} value={key}>
                  {formatFeature(key)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          subFeatures?.length === 0 && (
            <CenterColumn extraStyle={{ height: "80%" }}>
              <div style={{ fontSize: 12 }}>
                No sub-features for this feature{" "}
              </div>
            </CenterColumn>
          )
        )}
      </div>
    </div>
  );
}

const paddingStyle = {
  paddingBottom: 20,
};
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

function formatFeature(feature) {
  return lodash.startCase(feature.replace("_", " ").toLowerCase());
}
