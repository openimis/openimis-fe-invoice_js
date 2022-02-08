import {
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  parseData,
  pageInfo,
  decodeId,
} from "@openimis/fe-core";
import { REQUEST, SUCCESS, ERROR } from "./util/action-type";
import { getEnumValue } from "./util/enum";

export const ACTION_TYPE = {
  MUTATION: "INVOICE_MUTATION",
  SEARCH_INVOICES: "INVOICE_INVOICES",
  GET_INVOICE: "INVOICE_INVOICE",
  DELETE_INVOICE: "INVOICE_DELETE_INVOICE",
  SEARCH_INVOICE_LINE_ITEMS: "INVOICE_INVOICE_LINE_ITEMS",
  SEARCH_INVOICE_PAYMENTS: "INVOICE_INVOICE_PAYMENTS",
  CREATE_INVOICE_PAYMENT: "INVOICE_CREATE_INVOICE_PAYMENT",
  UPDATE_INVOICE_PAYMENT: "INVOICE_UPDATE_INVOICE_PAYMENT",
  DELETE_INVOICE_PAYMENT: "INVOICE_DELETE_INVOICE_PAYMENT",
  SEARCH_INVOICE_EVENTS: "INVOICE_INVOICE_EVENTS",
  CREATE_INVOICE_EVENT_MESSAGE: "INVOICE_CREATE_INVOICE_EVENT_MESSAGE",
  SEARCH_BILLS: "SEARCH_BILLS",
};

function reducer(
  state = {
    submittingMutation: false,
    mutation: {},
    fetchingInvoices: false,
    errorInvoices: null,
    fetchedInvoices: false,
    invoices: [],
    invoicesPageInfo: {},
    invoicesTotalCount: 0,
    fetchingInvoice: false,
    errorInvoice: null,
    fetchedInvoice: false,
    invoice: null,
    fetchingInvoiceLineItems: false,
    errorInvoiceLineItems: null,
    fetchedInvoiceLineItems: false,
    invoiceLineItems: [],
    invoiceLineItemsPageInfo: {},
    invoiceLineItemsTotalCount: 0,
    fetchingInvoicePayments: false,
    errorInvoicePayments: null,
    fetchedInvoicePayments: false,
    invoicePayments: [],
    invoicePaymentsPageInfo: {},
    invoicePaymentsTotalCount: 0,
    fetchingInvoiceEvents: false,
    errorInvoiceEvents: null,
    fetchedInvoiceEvents: false,
    invoiceEvents: [],
    invoiceEventsPageInfo: {},
    invoiceEventsTotalCount: 0,

    fetchingBills: false,
    errorBills: null,
    fetchedBills: false,
    bills: [],
    billsPageInfo: {},
    billsTotalCount: 0,
    fetchingBill: false,
    errorBill: null,
    fetchedBill: false,
    bill: null,
  },
  action,
) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_INVOICES):
      return {
        ...state,
        fetchingInvoices: true,
        fetchedInvoices: false,
        invoices: [],
        invoicesPageInfo: {},
        invoicesTotalCount: 0,
        errorInvoices: null,
      };
    case REQUEST(ACTION_TYPE.GET_INVOICE):
      return {
        ...state,
        fetchingInvoice: true,
        fetchedInvoice: false,
        invoice: null,
        errorInvoice: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_INVOICE_LINE_ITEMS):
      return {
        ...state,
        fetchingInvoiceLineItems: true,
        fetchedInvoiceLineItems: false,
        invoiceLineItems: [],
        invoiceLineItemsPageInfo: {},
        invoiceLineItemsTotalCount: 0,
        errorInvoiceLineItems: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_INVOICE_PAYMENTS):
      return {
        ...state,
        fetchingInvoicePayments: true,
        fetchedInvoicePayments: false,
        invoicePayments: [],
        invoicePaymentsPageInfo: {},
        invoicePaymentsTotalCount: 0,
        errorInvoicePayments: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_INVOICE_EVENTS):
      return {
        ...state,
        fetchingInvoiceEvents: true,
        fetchedInvoiceEvents: false,
        invoiceEvents: [],
        invoiceEventsPageInfo: {},
        invoiceEventsTotalCount: 0,
        errorInvoiceEvents: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INVOICES):
      return {
        ...state,
        fetchingInvoices: false,
        fetchedInvoices: true,
        invoices: parseData(action.payload.data.invoice)?.map((invoice) => ({
          ...invoice,
          id: decodeId(invoice.id),
          status: getEnumValue(invoice?.status),
        })),
        invoicesPageInfo: pageInfo(action.payload.data.invoice),
        invoicesTotalCount: !!action.payload.data.invoice ? action.payload.data.invoice.totalCount : null,
        errorInvoices: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_INVOICE):
      return {
        ...state,
        fetchingInvoice: false,
        fetchedInvoice: true,
        invoice: parseData(action.payload.data.invoice).map((invoice) => ({
          ...invoice,
          id: decodeId(invoice.id),
          status: getEnumValue(invoice?.status),
        }))?.[0],
        errorInvoice: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INVOICE_LINE_ITEMS):
      return {
        ...state,
        fetchingInvoiceLineItems: false,
        fetchedInvoiceLineItems: true,
        invoiceLineItems: parseData(action.payload.data.invoiceLineItem)?.map((invoiceLineItem) => ({
          ...invoiceLineItem,
          id: decodeId(invoiceLineItem.id),
        })),
        invoiceLineItemsPageInfo: pageInfo(action.payload.data.invoiceLineItem),
        invoiceLineItemsTotalCount: action.payload.data.invoiceLineItem?.totalCount,
        errorInvoiceLineItems: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INVOICE_PAYMENTS):
      return {
        ...state,
        fetchingInvoicePayments: false,
        fetchedInvoicePayments: true,
        invoicePayments: parseData(action.payload.data.invoicePayment)?.map((invoicePayment) => ({
          ...invoicePayment,
          id: decodeId(invoicePayment.id),
          status: getEnumValue(invoicePayment?.status),
        })),
        invoicePaymentsPageInfo: pageInfo(action.payload.data.invoicePayment),
        invoicePaymentsTotalCount: action.payload.data.invoicePayment?.totalCount,
        errorInvoicePayments: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INVOICE_EVENTS):
      return {
        ...state,
        fetchingInvoiceEvents: false,
        fetchedInvoiceEvents: true,
        invoiceEvents: parseData(action.payload.data.invoiceEvent)?.map((invoiceEvent) => ({
          ...invoiceEvent,
          eventType: getEnumValue(invoiceEvent?.eventType),
        })),
        invoiceEventsPageInfo: pageInfo(action.payload.data.invoiceEvent),
        invoiceEventsTotalCount: action.payload.data.invoiceEvent?.totalCount,
        errorInvoiceEvents: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INVOICES):
      return {
        ...state,
        fetchingInvoices: false,
        errorInvoices: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_INVOICE):
      return {
        ...state,
        fetchingInvoice: false,
        errorInvoice: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INVOICE_LINE_ITEMS):
      return {
        ...state,
        fetchingInvoiceLineItems: false,
        errorInvoiceLineItems: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INVOICE_PAYMENTS):
      return {
        ...state,
        fetchingInvoicePayments: false,
        errorInvoicePayments: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INVOICE_EVENTS):
      return {
        ...state,
        fetchingInvoiceEvents: false,
        errorInvoiceEvents: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_BILLS):
      return {
        ...state,
        fetchingBills: true,
        fetchedBills: false,
        bills: [],
        billsPageInfo: {},
        billsTotalCount: 0,
        errorBills: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BILLS):
      return {
        ...state,
        fetchingBills: false,
        fetchedBills: true,
        bills: parseData(action.payload.data.bill)?.map((bill) => ({
          ...bill,
          id: decodeId(bill.id),
          status: getEnumValue(bill?.status),
        })),
        billsPageInfo: pageInfo(action.payload.data.bill),
        billsTotalCount: !!action.payload.data.bill ? action.payload.data.bill.totalCount : null,
        errorBills: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BILLS):
      return {
        ...state,
        fetchingBills: false,
        errorBills: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.DELETE_INVOICE):
      return dispatchMutationResp(state, "deleteInvoice", action);
    case SUCCESS(ACTION_TYPE.CREATE_INVOICE_PAYMENT):
      return dispatchMutationResp(state, "createInvoicePayment", action);
    case SUCCESS(ACTION_TYPE.UPDATE_INVOICE_PAYMENT):
      return dispatchMutationResp(state, "updateInvoicePayment", action);
    case SUCCESS(ACTION_TYPE.DELETE_INVOICE_PAYMENT):
      return dispatchMutationResp(state, "deleteInvoicePayment", action);
    case SUCCESS(ACTION_TYPE.CREATE_INVOICE_EVENT_MESSAGE):
      return dispatchMutationResp(state, "createInvoiceEventMessage", action);
    default:
      return state;
  }
}

export default reducer;
