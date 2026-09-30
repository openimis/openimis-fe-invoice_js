import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer, ACTION_TYPE } = await import("./reducer");
const { ERROR, REQUEST, SUCCESS } = await import("./util/action-type");
const { globalId, graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, actionType, data, extra = {}) =>
  dispatch(state, SUCCESS(actionType), { payload: { data, ...extra } });
const fail = (state, actionType, payload = serverError(500, "Internal Server Error", "boom")) =>
  dispatch(state, ERROR(actionType), { payload });

const capitalise = (field) => `${field.charAt(0).toUpperCase()}${field.slice(1)}`;
const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };
const DATA_ERROR = { code: "Data error", message: "Server returned data error status", detail: "bad filter" };
const STALE_ERROR = { code: 400, message: "stale", detail: null };

describe("invoice reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toEqual({});
      expect(state.invoices).toEqual([]);
      expect(state.bills).toEqual([]);
      expect(state.paymentInvoices).toEqual([]);
      expect(state.detailPaymentInvoices).toEqual([]);
      expect(state.invoice).toBeNull();
      expect(state.bill).toBeNull();
      expect(state.billsExport).toBeNull();
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("searches", () => {
    // [label, action type, response key, state field, enum field, ids are decoded]
    const SEARCHES = [
      ["invoices", ACTION_TYPE.SEARCH_INVOICES, "invoice", "invoices", "status", true],
      ["invoice line items", ACTION_TYPE.SEARCH_INVOICE_LINE_ITEMS, "invoiceLineItem", "invoiceLineItems", null, true],
      ["invoice payments", ACTION_TYPE.SEARCH_INVOICE_PAYMENTS, "invoicePayment", "invoicePayments", "status", true],
      ["invoice events", ACTION_TYPE.SEARCH_INVOICE_EVENTS, "invoiceEvent", "invoiceEvents", "eventType", false],
      ["bills", ACTION_TYPE.SEARCH_BILLS, "bill", "bills", "status", true],
      ["bill line items", ACTION_TYPE.SEARCH_BILL_LINE_ITEMS, "billItem", "billLineItems", null, true],
      ["bill payments", ACTION_TYPE.SEARCH_BILL_PAYMENT, "billPayment", "billPayments", "status", true],
      ["bill events", ACTION_TYPE.SEARCH_BILL_EVENTS, "billEvent", "billEvents", "eventType", false],
      [
        "payment invoices",
        ACTION_TYPE.SEARCH_PAYMENT_INVOICE,
        "paymentInvoice",
        "paymentInvoices",
        "reconciliationStatus",
        true,
      ],
      [
        "payment invoice details",
        ACTION_TYPE.SEARCH_DETAIL_PAYMENT_INVOICE,
        "detailPaymentInvoice",
        "detailPaymentInvoices",
        "reconciliationStatus",
        true,
      ],
    ];
    const OWN_ERROR_RESET = SEARCHES.filter(([, actionType]) => actionType !== ACTION_TYPE.SEARCH_DETAIL_PAYMENT_INVOICE);

    const node = (decodeIds, value, extra = {}) =>
      decodeIds ? { id: globalId("Type", value), code: value, ...extra } : { code: value, ...extra };
    const decoded = (decodeIds, value, extra = {}) =>
      decodeIds ? { id: value, code: value, ...extra } : { code: value, ...extra };

    it.each(SEARCHES)("empties the %s list when a search starts", (_label, actionType, _key, field) => {
      const Field = capitalise(field);
      const stale = {
        ...initial(),
        [field]: [{ id: "old" }],
        [`${field}PageInfo`]: { totalCount: 1 },
        [`${field}TotalCount`]: 1,
        [`fetched${Field}`]: true,
      };
      const state = dispatch(stale, REQUEST(actionType));

      expect(state[`fetching${Field}`]).toBe(true);
      expect(state[`fetched${Field}`]).toBe(false);
      expect(state[field]).toEqual([]);
      expect(state[`${field}PageInfo`]).toEqual({});
      expect(state[`${field}TotalCount`]).toBe(0);
    });

    it.each(OWN_ERROR_RESET)("forgets the previous %s failure when a search starts", (_label, actionType, _key, field) => {
      const errorField = `error${capitalise(field)}`;
      const state = dispatch({ ...initial(), [errorField]: STALE_ERROR }, REQUEST(actionType));

      expect(state[errorField]).toBeNull();
    });

    // Currently fails: the detail search resets errorPaymentInvoices instead of its own
    // errorDetailPaymentInvoices, so the old detail error survives and the payment list's is wiped.
    it.fails("forgets the previous payment invoice details failure, and only that, when a search starts", () => {
      const state = dispatch(
        { ...initial(), errorDetailPaymentInvoices: STALE_ERROR, errorPaymentInvoices: SERVER_ERROR },
        REQUEST(ACTION_TYPE.SEARCH_DETAIL_PAYMENT_INVOICE),
      );

      expect(state.errorDetailPaymentInvoices).toBeNull();
      expect(state.errorPaymentInvoices).toEqual(SERVER_ERROR);
    });

    it.each(SEARCHES)("stores a page of %s with its count and cursors", (_label, actionType, key, field, _e, ids) => {
      const Field = capitalise(field);
      const requested = dispatch(initial(), REQUEST(actionType));
      const state = respond(requested, actionType, {
        [key]: relayPage([node(ids, "row-1"), node(ids, "row-2")], {
          totalCount: 12,
          pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
        }),
      });

      expect(state[field]).toEqual([decoded(ids, "row-1"), decoded(ids, "row-2")]);
      expect(state[`${field}TotalCount`]).toBe(12);
      expect(state[`${field}PageInfo`]).toMatchObject({ totalCount: 12, hasNextPage: true, endCursor: "cursor-2" });
      expect(state[`fetching${Field}`]).toBe(false);
      expect(state[`fetched${Field}`]).toBe(true);
      expect(state[`error${Field}`]).toBeNull();
    });

    it.each(SEARCHES.filter(([, , , , enumField]) => enumField))(
      "keeps the %s enum values exactly as the server sent them",
      (_label, actionType, key, field, enumField, ids) => {
        const state = respond(initial(), actionType, {
          [key]: relayPage([node(ids, "row-1", { [enumField]: "A_2" }), node(ids, "row-2")]),
        });

        expect(state[field][0][enumField]).toBe("A_2");
        expect(state[field][1][enumField]).toBeUndefined();
      },
    );

    it.each(SEARCHES)("reports a data error returned with the %s page", (_label, actionType, key, field) => {
      const state = respond(initial(), actionType, { [key]: null }, graphqlErrors("bad filter"));

      expect(state[`error${capitalise(field)}`]).toEqual(DATA_ERROR);
      expect(state[field]).toEqual([]);
      expect(state[`${field}PageInfo`]).toEqual({});
    });

    it.each(SEARCHES)("stops fetching %s and reports a server failure", (_label, actionType, _key, field) => {
      const Field = capitalise(field);
      const state = fail(dispatch(initial(), REQUEST(actionType)), actionType);

      expect(state[`fetching${Field}`]).toBe(false);
      expect(state[`fetched${Field}`]).toBe(false);
      expect(state[`error${Field}`]).toEqual(SERVER_ERROR);
    });

    it("reports no invoice or bill total when the list is missing from the response", () => {
      expect(respond(initial(), ACTION_TYPE.SEARCH_INVOICES, { invoice: null }).invoicesTotalCount).toBeNull();
      expect(respond(initial(), ACTION_TYPE.SEARCH_BILLS, { bill: null }).billsTotalCount).toBeNull();
    });

    it("keeps a server failure without a response body readable", () => {
      const state = fail(initial(), ACTION_TYPE.SEARCH_INVOICES, serverError(502, "Bad Gateway"));

      expect(state.errorInvoices).toEqual({ code: 502, message: "Bad Gateway", detail: null });
    });

    it("leaves the other lists alone while one is searched", () => {
      const loaded = respond(initial(), ACTION_TYPE.SEARCH_INVOICES, {
        invoice: relayPage([{ id: globalId("InvoiceGQLType", "inv-1") }]),
      });
      const state = dispatch(loaded, REQUEST(ACTION_TYPE.SEARCH_BILLS));

      expect(state.invoices).toEqual([{ id: "inv-1", status: undefined }]);
      expect(state.fetchingInvoices).toBe(false);
    });
  });

  describe("single records", () => {
    const RECORDS = [
      ["invoice", ACTION_TYPE.GET_INVOICE, "invoice", "Invoice"],
      ["bill", ACTION_TYPE.GET_BILL, "bill", "Bill"],
    ];

    it.each(RECORDS)("drops the previous %s when a lookup starts", (_label, actionType, field, Field) => {
      const stale = { ...initial(), [field]: { id: "old" }, [`fetched${Field}`]: true, [`error${Field}`]: STALE_ERROR };
      const state = dispatch(stale, REQUEST(actionType));

      expect(state[field]).toBeNull();
      expect(state[`fetching${Field}`]).toBe(true);
      expect(state[`fetched${Field}`]).toBe(false);
      expect(state[`error${Field}`]).toBeNull();
    });

    it.each(RECORDS)("keeps the first %s the lookup returns, with its id decoded", (_label, actionType, field, Field) => {
      const state = respond(dispatch(initial(), REQUEST(actionType)), actionType, {
        [field]: relayPage([
          { id: globalId("GQLType", `${field}-1`), code: "C-1", status: "A_1", amountTotal: "150.50" },
          { id: globalId("GQLType", `${field}-2`), code: "C-2" },
        ]),
      });

      expect(state[field]).toMatchObject({ id: `${field}-1`, code: "C-1", status: "A_1", amountTotal: "150.50" });
      expect(state[`fetching${Field}`]).toBe(false);
      expect(state[`fetched${Field}`]).toBe(true);
      expect(state[`error${Field}`]).toBeNull();
    });

    it.each(RECORDS)("holds no %s when the lookup matches nothing", (_label, actionType, field) => {
      expect(respond(initial(), actionType, { [field]: relayPage([]) })[field]).toBeUndefined();
      expect(respond(initial(), actionType, { [field]: null })[field]).toBeUndefined();
    });

    it.each(RECORDS)("stops fetching the %s and reports a server failure", (_label, actionType, field, Field) => {
      const state = fail(dispatch(initial(), REQUEST(actionType)), actionType);

      expect(state[`fetching${Field}`]).toBe(false);
      expect(state[`fetched${Field}`]).toBe(false);
      expect(state[`error${Field}`]).toEqual(SERVER_ERROR);
    });

    it("derives whitespace-free subject and third party labels for a bill", () => {
      const state = respond(initial(), ACTION_TYPE.GET_BILL, {
        bill: relayPage([
          { id: globalId("BillGQLType", "bill-1"), subjectTypeName: "batch run", thirdpartyTypeName: "health facility" },
        ]),
      });

      expect(state.bill.subjectTypeNameLabel).toBe("batchrun");
      expect(state.bill.thirdpartyTypeNameLabel).toBe("healthfacility");
    });

    it("leaves the bill labels empty when the bill has no subject or third party", () => {
      const state = respond(initial(), ACTION_TYPE.GET_BILL, {
        bill: relayPage([{ id: globalId("BillGQLType", "bill-1") }]),
      });

      expect(state.bill.subjectTypeNameLabel).toBeUndefined();
      expect(state.bill.thirdpartyTypeNameLabel).toBeUndefined();
    });
  });

  describe("bill export", () => {
    it("forgets the previous export when a new one is requested", () => {
      const stale = { ...initial(), billsExport: "/old.csv", fetchedBillsExport: true, errorBillsExport: STALE_ERROR };
      const state = dispatch(stale, REQUEST(ACTION_TYPE.BILL_EXPORT));

      expect(state).toMatchObject({
        fetchingBillsExport: true,
        fetchedBillsExport: false,
        billsExport: null,
        billsExportPageInfo: {},
        errorBillsExport: null,
      });
    });

    it("stores the location of the generated file", () => {
      const state = respond(dispatch(initial(), REQUEST(ACTION_TYPE.BILL_EXPORT)), ACTION_TYPE.BILL_EXPORT, {
        billExport: "/export/bills.csv",
      });

      expect(state.billsExport).toBe("/export/bills.csv");
      expect(state.fetchingBillsExport).toBe(false);
      expect(state.fetchedBillsExport).toBe(true);
      expect(state.errorBillsExport).toBeNull();
    });

    it("reports a data error returned instead of the file", () => {
      const state = respond(initial(), ACTION_TYPE.BILL_EXPORT, { billExport: null }, graphqlErrors("bad filter"));

      expect(state.billsExport).toBeNull();
      expect(state.errorBillsExport).toEqual(DATA_ERROR);
    });

    it("stops exporting and reports a server failure", () => {
      const state = fail(dispatch(initial(), REQUEST(ACTION_TYPE.BILL_EXPORT)), ACTION_TYPE.BILL_EXPORT);

      expect(state.fetchingBillsExport).toBe(false);
      expect(state.errorBillsExport).toEqual(SERVER_ERROR);
    });
  });

  describe("mutations", () => {
    const MUTATION_RESULTS = [
      [ACTION_TYPE.DELETE_INVOICE, "deleteInvoice"],
      [ACTION_TYPE.CREATE_INVOICE_PAYMENT, "createInvoicePayment"],
      [ACTION_TYPE.UPDATE_INVOICE_PAYMENT, "updateInvoicePayment"],
      [ACTION_TYPE.DELETE_INVOICE_PAYMENT, "deleteInvoicePayment"],
      [ACTION_TYPE.CREATE_INVOICE_EVENT_MESSAGE, "createInvoiceEventMessage"],
      [ACTION_TYPE.DELETE_BILL, "deleteBill"],
      [ACTION_TYPE.CREATE_BILL_PAYMENT, "createBillPayment"],
      [ACTION_TYPE.UPDATE_BILL_PAYMENT, "updateBillPayment"],
      [ACTION_TYPE.DELETE_BILL_PAYMENT, "deleteBillPayment"],
      [ACTION_TYPE.CREATE_BILL_EVENT_MESSAGE, "createBillEventType"],
      [ACTION_TYPE.CREATE_PAYMENT_INVOICE_WITH_DETAIL, "createPaymentWithDetailInvoice"],
      [ACTION_TYPE.DELETE_PAYMENT_INVOICE, "deletePaymentInvoice"],
    ];

    const submitting = () =>
      dispatch(initial(), REQUEST(ACTION_TYPE.MUTATION), {
        meta: { clientMutationId: "cmid-1", clientMutationLabel: "Delete invoice INV-1" },
      });

    it("records the request metadata while a mutation is in flight", () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: "cmid-1", clientMutationLabel: "Delete invoice INV-1" },
      });
    });

    it.each(MUTATION_RESULTS)("clears the in-flight flag and keeps the internal id of %s", (actionType, service) => {
      const state = respond(submitting(), actionType, { [service]: { internalId: "internal-1" } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toMatchObject({ id: "internal-1", clientMutationLabel: "Delete invoice INV-1" });
    });

    it("raises an alert when a mutation fails", () => {
      const state = fail(submitting(), ACTION_TYPE.MUTATION, { status: 500, statusText: "Internal Server Error" });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: dispatchMutationErr in fe-core only stores the alert, so the module
    // is left believing the mutation is still being submitted.
    it.fails("stops submitting once a mutation has failed", () => {
      expect(fail(submitting(), ACTION_TYPE.MUTATION, { status: 500 }).submittingMutation).toBe(false);
    });
  });
});
