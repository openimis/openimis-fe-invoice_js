import React from "react";
import { Grid, Typography } from "@mui/material";
import { formatMessage, PublishedComponent, FormattedMessage, Tab } from "@openimis/fe-core";
import { BILL_PAYMENTS_TAB_VALUE, RIGHT_BILL_PAYMENT_SEARCH, RIGHT_BILL_PAYMENT_CREATE } from "../constants";
import BillPaymentsSearcher from "./BillPaymentsSearcher";
import CreateBillPaymentDialog from "../dialogs/BillPaymentDialog";

const BillPaymentsTabLabel = ({ intl, rights, onChange, tabStyle, isSelected }) =>
  rights?.includes(RIGHT_BILL_PAYMENT_SEARCH) && (
    <Tab
      onChange={onChange}
      className={tabStyle(BILL_PAYMENTS_TAB_VALUE)}
      selected={isSelected(BILL_PAYMENTS_TAB_VALUE)}
      value={BILL_PAYMENTS_TAB_VALUE}
      label={formatMessage(intl, "invoice", "billPayments.label")}
    />
  );

const BillPaymentsTabPanel = ({ rights, value, bill }) => (
  <PublishedComponent pubRef="policyHolder.TabPanel" module="bill" index={BILL_PAYMENTS_TAB_VALUE} value={value}>
    {rights?.includes(RIGHT_BILL_PAYMENT_CREATE) && (
      <Grid container justify="flex-end" spacing={1} sx={{
        alignItems: "center"
      }}>
        <Grid>
          <Typography>
            <FormattedMessage module="invoice" id="billPayment.create.label" />
          </Typography>
        </Grid>
        <Grid>
          <CreateBillPaymentDialog bill={bill} />
        </Grid>
      </Grid>
    )}
    <BillPaymentsSearcher bill={bill} rights={rights} />
  </PublishedComponent>
);

export { BillPaymentsTabLabel, BillPaymentsTabPanel };
