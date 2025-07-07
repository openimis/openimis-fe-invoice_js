import React from "react";
import { DoubleArrow } from "@material-ui/icons";
import { FormattedMessage } from "@openimis/fe-core";
import messages_en from "./translations/en.json";
import reducer from "./reducer";
import flatten from "flat";
import LegalAndFinanceMainMenu from "./menus/LegalAndFinanceMainMenu";
import { DoubleArrowFlipped } from "./menus/LegalAndFinanceMainMenu";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceStatusPicker from "./pickers/InvoiceStatusPicker";
import SubjectTypePickerBill from "./pickers/SubjectTypePickerBill";
import ThirdPartyTypePickerBill from "./pickers/ThirdPartyTypePickerBill";
import InvoicePage from "./pages/InvoicePage";
import BillsPage from "./pages/BillsPage";
import BillPage from "./pages/BillPage";
import { InvoiceLineItemsTabLabel, InvoiceLineItemsTabPanel } from "./components/InvoiceLineItemsTab";
import { InvoicePaymentsTabLabel, InvoicePaymentsTabPanel } from "./components/InvoicePaymentsTab";
import { InvoiceEventsTabLabel, InvoiceEventsTabPanel } from "./components/InvoiceEventsTab";
import { BillLineItemsTabLabel, BillLineItemsTabPanel } from "./components/BillLineItemsTab";
import { BillPaymentsTabLabel, BillPaymentsTabPanel } from "./components/BillPaymentsTab";
import { BillEventsTabLabel, BillEventsTabPanel } from "./components/BillEventsTab";
import { getSubjectAndThirdpartyTypePicker } from "./util/subject-and-thirdparty-picker";
import { fetchBillLineItems } from "./actions";
import {
  RIGHT_INVOICE_SEARCH,
  RIGHT_BILL_SEARCH,
  RIGHT_BILL_AMEND,
  RIGHT_INVOICE_AMEND,
} from "./constants";

const ROUTE_INVOICES = "invoices";
const ROUTE_INVOICE = "invoices/invoice";
const ROUTE_BILLS = "bills";
const ROUTE_BILL = "bills/bill";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: flatten(messages_en) }],
  "reducers": [{ key: "invoice", reducer }],
  "core.MainMenu": [{
    name: 'LegalAndFinanceMainMenu',
    component: LegalAndFinanceMainMenu,
  }],
  "core.Router": [
    { path: ROUTE_INVOICES, component: InvoicesPage },
    { path: ROUTE_INVOICE + "/:invoice_uuid?", component: InvoicePage },
    { path: ROUTE_BILLS, component: BillsPage },
    { path: ROUTE_BILL + "/:bill_uuid?", component: BillPage },
  ],
  "refs": [
    { key: "invoice.route.invoice", ref: ROUTE_INVOICE },
    { key: "invoice.InvoiceStatusPicker", ref: InvoiceStatusPicker },
    { key: "invoice.SubjectTypePickerBill", ref: SubjectTypePickerBill },
    { key: "invoice.ThirdPartyTypePickerBill", ref: ThirdPartyTypePickerBill },
    { key: "bill.route.bill", ref: ROUTE_BILL },
    { key: "bill.util.getSubjectAndThirdpartyTypePicker", ref: getSubjectAndThirdpartyTypePicker },
    { key: "bill.action.fetchBillLineItems", ref: fetchBillLineItems },
  ],
  "invoice.TabPanel.label": [InvoiceLineItemsTabLabel, InvoicePaymentsTabLabel, InvoiceEventsTabLabel],
  "invoice.TabPanel.panel": [InvoiceLineItemsTabPanel, InvoicePaymentsTabPanel, InvoiceEventsTabPanel],
  "bill.TabPanel.label": [BillLineItemsTabLabel, BillPaymentsTabLabel, BillEventsTabLabel],
  "bill.TabPanel.panel": [BillLineItemsTabPanel, BillPaymentsTabPanel, BillEventsTabPanel],
  "invoice.MainMenu": [
    {
      text: <FormattedMessage module="invoice" id="menu.invoices" />,
      icon: <DoubleArrow />,
      route: "/invoices",
      id: "legalAndFinance.invoices",
      filter: (rights) => rights.filter((r) => r >= RIGHT_INVOICE_SEARCH && r <= RIGHT_INVOICE_AMEND).length > 0,
    },
    {
      text: <FormattedMessage module="invoice" id="menu.bills" />,
      icon: <DoubleArrowFlipped />,
      route: "/bills",
      id: "legalAndFinance.bills",
      filter: (rights) => rights.filter((r) => r >= RIGHT_BILL_SEARCH && r <= RIGHT_BILL_AMEND).length > 0,
    }
  ],
};

export const InvoiceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};
