import React from "react";
import { Tab } from "@material-ui/core";
import { formatMessage, PublishedComponent, FormattedMessage } from "@openimis/fe-core";
import { INVOICE_EVENTS_TAB_VALUE, RIGHT_INVOICE_EVENT_SEARCH, RIGHT_INVOICE_EVENT_CREATE_MESSAGE } from "../constants";
import { Grid, Typography } from "@material-ui/core";
import CreateInvoiceEventMessageDialog from "../dialogs/InvoiceEventMessageDialog";
import InvoiceEventsSearcher from "./InvoiceEventsSearcher";

const InvoiceEventsTabLabel = ({ intl, rights, onChange, tabStyle, isSelected }) =>
  rights?.includes(RIGHT_INVOICE_EVENT_SEARCH) && (
    <Tab
      onChange={onChange}
      className={tabStyle(INVOICE_EVENTS_TAB_VALUE)}
      selected={isSelected(INVOICE_EVENTS_TAB_VALUE)}
      value={INVOICE_EVENTS_TAB_VALUE}
      label={formatMessage(intl, "invoice", "invoiceEvents.label")}
    />
  );

const InvoiceEventsTabPanel = ({ rights, value, invoice }) => (
  <PublishedComponent pubRef="policyHolder.TabPanel" module="invoice" index={INVOICE_EVENTS_TAB_VALUE} value={value}>
    {rights?.includes(RIGHT_INVOICE_EVENT_CREATE_MESSAGE) && (
      <Grid container justify="flex-end" alignItems="center" spacing={1}>
        <Grid item>
          <Typography>
            <FormattedMessage module="invoice" id="invoiceEventMessage.create.label" />
          </Typography>
        </Grid>
        <Grid item>
          <CreateInvoiceEventMessageDialog invoice={invoice} />
        </Grid>
      </Grid>
    )}
    <InvoiceEventsSearcher invoice={invoice} />
  </PublishedComponent>
);

export { InvoiceEventsTabLabel, InvoiceEventsTabPanel };
