import React from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  withModulesManager,
  formatMessage,
  TextInput,
  NumberInput,
  PublishedComponent,
  GRID_RESPONSIVE_STANDARD,
} from "@openimis/fe-core";
import { CONTAINS_LOOKUP, DEFAULT, DEFUALT_DEBOUNCE_TIME } from "../constants";
import { defaultFilterStyles } from "../util/styles";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";
import ThirdPartyTypePickerBill from "../pickers/ThirdPartyTypePickerBill";
import SubjectTypePickerBill from "../pickers/SubjectTypePickerBill";

const StyledBillFilter = styled('div')(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

const BillFilter = ({ intl, filters, onChangeFilters, modulesManager }) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFUALT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const filterTextFieldValue = (filterName) => (filters[filterName] ? filters[filterName].value : "");

  const onChangeDecimalFilter = (filterName) => (value) => {
    const decimalValue = Number(value).toFixed(2);
    debouncedOnChangeFilters([
      {
        id: filterName,
        value: !!decimalValue ? decimalValue : null,
        filter: `${filterName}: "${decimalValue}"`,
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
    <StyledBillFilter>
      <Grid container className="form">
        {<>
            <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
              <SubjectTypePickerBill
                label="subject"
                withNull
                nullLabel={formatMessage(intl, "bill", "any")}
                value={filterValue("subjectType")}
                onChange={onChangeStringFilter("subjectType")}
              />
            </Grid>
            <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
              <ThirdPartyTypePickerBill
                label="thirdparty"
                withNull
                nullLabel={formatMessage(intl, "bill", "any")}
                value={filterValue("thirdpartyType")}
                onChange={onChangeStringFilter("thirdpartyType")}
              />
            </Grid>
          </>}
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <TextInput
            module="bill"
            label="code"
            value={filterTextFieldValue("code")}
            onChange={onChangeStringFilter("code", CONTAINS_LOOKUP)}
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <PublishedComponent
            pubRef="core.DatePicker"
            module="bill"
            label="dateBill"
            value={filterValue("dateBill")}
            onChange={(v) =>
              onChangeFilters([
                {
                  id: "dateBill",
                  value: v,
                  filter: `dateBill: "${v}"`,
                },
              ])
            }
          />
        </Grid>
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <InvoiceStatusPicker
            label="status.label"
            withNull
            nullLabel={formatMessage(intl, "bill", "any")}
            value={filterValue("status")}
            onChange={(value) =>
              onChangeFilters([
                {
                  id: "status",
                  value: value,
                  // probably won't work on mssql https://openimis.atlassian.net/browse/OP-1546
                  filter: `status: ${value}`,
                },
              ])
            }
          />
        </Grid>
        {<Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <NumberInput
              module="bill"
              label="amountTotal"
              min={0}
              value={filterValue("amountTotal")}
              onChange={onChangeDecimalFilter("amountTotal")}
            />
          </Grid>}
      </Grid>
    </StyledBillFilter>
  );
};

export { StyledBillFilter };
export default withModulesManager(injectIntl(BillFilter));
