import React from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import { formatMessage, TextInput, GRID_RESPONSIVE_STANDARD } from "@openimis/fe-core";
import { CONTAINS_LOOKUP, DEFUALT_DEBOUNCE_TIME } from "../constants";
import { defaultFilterStyles } from "../util/styles";
import InvoiceEventTypePicker from "../pickers/InvoiceEventTypePicker";

const StyledBillEventsFilter = styled('div')(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

const BillEventsFilter = ({ intl, filters, onChangeFilters }) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFUALT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const filterTextFieldValue = (filterName) => (filters[filterName] ? filters[filterName].value : "");

  const onChangeStringFilter =
    (filterName, lookup = null) =>
    (value) => {
      lookup
        ? debouncedOnChangeFilters([
            {
              id: filterName,
              value,
              filter: `${filterName}_${lookup}: "${value}"`,
            },
          ])
        : onChangeFilters([
            {
              id: filterName,
              value,
              filter: `${filterName}: "${value}"`,
            },
          ]);
    };

  return (
    <StyledBillEventsFilter>
      <Grid container className="form">
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <InvoiceEventTypePicker
            label="billEvent.eventType.label"
            withNull
            nullLabel={formatMessage(intl, "invoice", "any")}
            value={filterValue("eventType")}
            onChange={onChangeStringFilter("eventType")}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <TextInput
            module="invoice"
            label="billEvent.message"
            value={filterTextFieldValue("message")}
            onChange={onChangeStringFilter("message", CONTAINS_LOOKUP)}
          />
        </Grid>
      </Grid>
    </StyledBillEventsFilter>
  );
};

export { StyledBillEventsFilter };
export default injectIntl(BillEventsFilter);
