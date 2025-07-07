import React from "react";
import { Tab, Grid, Typography } from "@material-ui/core";
import { formatMessage, PublishedComponent, FormattedMessage } from "@openimis/fe-core";
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

const BillPaymentsTabPanel = ({ isWorker, rights, value, bill, setConfirmedAction }) => (
  <PublishedComponent pubRef="policyHolder.TabPanel" module="bill" index={BILL_PAYMENTS_TAB_VALUE} value={value}>
    {rights?.includes(RIGHT_BILL_PAYMENT_CREATE) && !isWorker && (
      <Grid container justify="flex-end" alignItems="center" spacing={1}>
        <Grid item>
          <Typography>
            <FormattedMessage module="invoice" id="billPayment.create.label" />
          </Typography>
        </Grid>
        <Grid item>
          <CreateBillPaymentDialog bill={bill} />
        </Grid>
      </Grid>
    )}
    <BillPaymentsSearcher bill={bill} isWorker={isWorker} rights={rights} setConfirmedAction={setConfirmedAction} />
  </PublishedComponent>
);

export { BillPaymentsTabLabel, BillPaymentsTabPanel };
