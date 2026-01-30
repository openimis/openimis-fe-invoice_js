import React from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import { withModulesManager, formatMessage, TextInput, NumberInput, PublishedComponent } from "@openimis/fe-core";
import { CONTAINS_LOOKUP, DEFAULT, DEFUALT_DEBOUNCE_TIME } from "../constants";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";
import ThirdPartyTypePickerBill from "../pickers/ThirdPartyTypePickerBill";
import SubjectTypePickerBill from "../pickers/SubjectTypePickerBill";

const StyledBillFilter = styled('div')(({ theme }) => ({
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
}));

const BillFilter = ({ intl, filters, onChangeFilters, modulesManager }) => {
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

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
        {!isWorker && (
          <>
            <Grid size={2} className="item">
              <SubjectTypePickerBill
                label="subject"
                withNull
                nullLabel={formatMessage(intl, "bill", "any")}
                value={filterValue("subjectType")}
                onChange={onChangeStringFilter("subjectType")}
              />
            </Grid>
            <Grid size={2} className="item">
              <ThirdPartyTypePickerBill
                label="thirdparty"
                withNull
                nullLabel={formatMessage(intl, "bill", "any")}
                value={filterValue("thirdpartyType")}
                onChange={onChangeStringFilter("thirdpartyType")}
              />
            </Grid>
          </>
        )}
        <Grid size={2} className="item">
          <TextInput
            module="bill"
            label="code"
            value={filterTextFieldValue("code")}
            onChange={onChangeStringFilter("code", CONTAINS_LOOKUP)}
          />
        </Grid>
        <Grid size={2} className="item">
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
        <Grid size={2} className="item">
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
                  filter: `status: A_${value}`,
                },
              ])
            }
          />
        </Grid>
        {!isWorker && (
          <Grid size={2} className="item">
            <NumberInput
              module="bill"
              label="amountTotal"
              min={0}
              value={filterValue("amountTotal")}
              onChange={onChangeDecimalFilter("amountTotal")}
            />
          </Grid>
        )}
      </Grid>
    </StyledBillFilter>
  );
};

export { StyledBillFilter };
export default withModulesManager(injectIntl(BillFilter));
