import React from "react";
import { Tab } from "@material-ui/core";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import { INVOICE_LINE_ITEMS_TAB_VALUE } from "../constants";
import InvoiceLineItemsSearcher from "./InvoiceLineItemsSearcher";

const InvoiceLineItemsTabLabel = ({ intl, onChange, tabStyle, isSelected }) => (
  <Tab
    onChange={onChange}
    className={tabStyle(INVOICE_LINE_ITEMS_TAB_VALUE)}
    selected={isSelected(INVOICE_LINE_ITEMS_TAB_VALUE)}
    value={INVOICE_LINE_ITEMS_TAB_VALUE}
    label={formatMessage(intl, "invoice", "invoiceLineItems.label")}
  />
);

const InvoiceLineItemsTabPanel = ({ value, invoice }) => (
  <PublishedComponent
    pubRef="policyHolder.TabPanel"
    module="invoice"
    index={INVOICE_LINE_ITEMS_TAB_VALUE}
    value={value}
  >
    <InvoiceLineItemsSearcher invoice={invoice} />
  </PublishedComponent>
);

export { InvoiceLineItemsTabLabel, InvoiceLineItemsTabPanel };
