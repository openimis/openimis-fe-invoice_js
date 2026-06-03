import React from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import { formatMessage, TextInput, NumberInput, PublishedComponent, GRID_RESPONSIVE_STANDARD } from "@openimis/fe-core";
import { CONTAINS_LOOKUP, DEFUALT_DEBOUNCE_TIME } from "../constants";
import { defaultFilterStyles } from "../util/styles";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";
import ThirdpartyTypePicker from "../pickers/ThirdpartyTypePicker";
import SubjectTypePicker from "../pickers/SubjectTypePicker";

const StyledInvoiceFilter = styled('div')(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

const InvoiceFilter = ({ intl, filters, onChangeFilters }) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFUALT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const filterTextFieldValue = (filterName) => (filters[filterName] ? filters[filterName].value : "");

  const onChangeFilter = (filterName) => (value) => {
    debouncedOnChangeFilters([
      {
        id: filterName,
        value: !!value ? value : null,
        filter: `${filterName}: ${value}`,
      },
    ]);
  };

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
    <StyledInvoiceFilter>
      <Grid container className="form">
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <SubjectTypePicker
            label="invoice.subject"
            withNull
            nullLabel={formatMessage(intl, "invoice", "any")}
            value={filterValue("subjectType")}
            onChange={onChangeStringFilter("subjectType")}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <ThirdpartyTypePicker
            label="invoice.thirdparty"
            withNull
            nullLabel={formatMessage(intl, "invoice", "any")}
            value={filterValue("thirdpartyType")}
            onChange={onChangeStringFilter("thirdpartyType")}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <TextInput
            module="invoice"
            label="invoice.code"
            value={filterTextFieldValue("code")}
            onChange={onChangeStringFilter("code", CONTAINS_LOOKUP)}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="invoice.dateInvoice"
            value={filterValue("dateInvoice")}
            onChange={(v) =>
              onChangeFilters([
                {
                  id: "dateInvoice",
                  value: v,
                  filter: `dateInvoice: "${v}"`,
                },
              ])
            }
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <InvoiceStatusPicker
            label="invoice.status.label"
            withNull
            nullLabel={formatMessage(intl, "invoice", "any")}
            value={filterValue("status")}
            onChange={(value) => onChangeFilters([
              {
                id: "status",
                value: value,
                filter: value ? `status: A_${value}` : null,
              },
            ])}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <NumberInput
            module="invoice"
            label="invoice.amountTotal"
            min={0}
            value={filterValue("amountTotal")}
            onChange={onChangeFilter("amountTotal")}
          />
        </Grid>
      </Grid>
    </StyledInvoiceFilter>
  );
};

export { StyledInvoiceFilter };
export default injectIntl(InvoiceFilter);
