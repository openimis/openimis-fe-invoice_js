import React from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import { TextInput, formatMessage, GRID_RESPONSIVE_STANDARD } from "@openimis/fe-core";
import { CONTAINS_LOOKUP, DEFUALT_DEBOUNCE_TIME } from "../constants";
import { defaultFilterStyles } from "../util/styles";
import InvoiceEventTypePicker from "../pickers/InvoiceEventTypePicker";

const StyledInvoiceEventsFilter = styled('div')(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

const InvoiceEventsFilter = ({ intl, filters, onChangeFilters }) => {
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
    <StyledInvoiceEventsFilter>
      <Grid container className="form">
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <InvoiceEventTypePicker
            label="invoiceEvent.eventType.label"
            withNull
            nullLabel={formatMessage(intl, "invoice", "any")}
            value={filterValue("eventType")}
            onChange={(value) =>
              onChangeFilters([
                {
                  id: "eventType",
                  value: value,
                  filter: `eventType: A_${value}`,
                },
              ])
            }
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <TextInput
            module="invoice"
            label="invoiceEvent.message"
            value={filterTextFieldValue("message")}
            onChange={onChangeStringFilter("message", CONTAINS_LOOKUP)}
          />
        </Grid>
      </Grid>
    </StyledInvoiceEventsFilter>
  );
};

export { StyledInvoiceEventsFilter };
export default injectIntl(InvoiceEventsFilter);
