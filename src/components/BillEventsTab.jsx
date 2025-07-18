import React from "react";
import { Tab, Grid, Typography } from "@material-ui/core";
import { formatMessage, PublishedComponent, FormattedMessage } from "@openimis/fe-core";
import { BILL_EVENTS_TAB_VALUE, RIGHT_BILL_EVENT_SEARCH, RIGHT_BILL_EVENT_CREATE_MESSAGE } from "../constants";
import BillEventsSearcher from "./BillEventsSearcher";
import CreateBillEventMessageDialog from "../dialogs/BillEventMessageDialog";

const BillEventsTabLabel = ({ intl, rights, onChange, tabStyle, isSelected, isWorker }) =>
  rights?.includes(RIGHT_BILL_EVENT_SEARCH) &&
  !isWorker && (
    <Tab
      onChange={onChange}
      className={tabStyle(BILL_EVENTS_TAB_VALUE)}
      selected={isSelected(BILL_EVENTS_TAB_VALUE)}
      value={BILL_EVENTS_TAB_VALUE}
      label={formatMessage(intl, "invoice", "billEvents.label")}
    />
  );

const BillEventsTabPanel = ({ isWorker, rights, value, bill }) =>
  !isWorker && (
    <PublishedComponent pubRef="policyHolder.TabPanel" module="bill" index={BILL_EVENTS_TAB_VALUE} value={value}>
      {rights?.includes(RIGHT_BILL_EVENT_CREATE_MESSAGE) && (
        <Grid container justify="flex-end" alignItems="center" spacing={1}>
          <Grid item>
            <Typography>
              <FormattedMessage module="invoice" id="billEventMessage.create.label" />
            </Typography>
          </Grid>
          <Grid item>
            <CreateBillEventMessageDialog bill={bill} />
          </Grid>
        </Grid>
      )}
      <BillEventsSearcher bill={bill} />
    </PublishedComponent>
  );

export { BillEventsTabLabel, BillEventsTabPanel };
