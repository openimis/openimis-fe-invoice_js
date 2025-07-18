import React from "react";
import { Tab } from "@material-ui/core";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import { BILL_LINE_ITEMS_TAB_VALUE } from "../constants";
import BillLineItemsSearcher from "./BillLineItemsSearcher";

const BillLineItemsTabLabel = ({ intl, onChange, tabStyle, isSelected }) => (
  <Tab
    onChange={onChange}
    className={tabStyle(BILL_LINE_ITEMS_TAB_VALUE)}
    selected={isSelected(BILL_LINE_ITEMS_TAB_VALUE)}
    value={BILL_LINE_ITEMS_TAB_VALUE}
    label={formatMessage(intl, "invoice", "billItems.label")}
  />
);

const BillLineItemsTabPanel = ({ isWorker, value, bill }) => (
  <PublishedComponent pubRef="policyHolder.TabPanel" module="bill" index={BILL_LINE_ITEMS_TAB_VALUE} value={value}>
    <BillLineItemsSearcher bill={bill} isWorker={isWorker} />
  </PublishedComponent>
);

export { BillLineItemsTabLabel, BillLineItemsTabPanel };
