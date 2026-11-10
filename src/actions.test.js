import { describe, expect, it, vi } from "vitest";

// Only fe-core's dispatcher is stubbed; the formatters are real, imported from their
// defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...core,
}));

const actions = await import("./actions");
const { ACTION_TYPE } = await import("./reducer");
const { ERROR, REQUEST, SUCCESS } = await import("./util/action-type");
const { EVENT_TYPE, PAYMENT_MAIN_STATUS, PAYMENT_STATUS } = await import("./constants");

const query = (result) => result.payload.replace(/\s+/g, " ");
const mutationInput = (result) => {
  const sent = query(result);
  return sent.slice(sent.indexOf("input: {"), sent.indexOf("}"));
};

describe("invoice actions", () => {
  describe("searches", () => {
    it.each([
      ["invoices", "fetchInvoices", ACTION_TYPE.SEARCH_INVOICES, "invoice"],
      ["invoice line items", "fetchInvoiceLineItems", ACTION_TYPE.SEARCH_INVOICE_LINE_ITEMS, "invoiceLineItem"],
      ["invoice payments", "fetchInvoicePayments", ACTION_TYPE.SEARCH_INVOICE_PAYMENTS, "invoicePayment"],
      ["invoice events", "fetchInvoiceEvents", ACTION_TYPE.SEARCH_INVOICE_EVENTS, "invoiceEvent"],
      ["bills", "fetchBills", ACTION_TYPE.SEARCH_BILLS, "bill"],
      ["bill line items", "fetchBillLineItems", ACTION_TYPE.SEARCH_BILL_LINE_ITEMS, "billItem"],
      ["bill payments", "fetchBillPayments", ACTION_TYPE.SEARCH_BILL_PAYMENT, "billPayment"],
      ["bill events", "fetchBillEvents", ACTION_TYPE.SEARCH_BILL_EVENTS, "billEvent"],
      ["payment invoices", "fetchPaymentInvoices", ACTION_TYPE.SEARCH_PAYMENT_INVOICE, "paymentInvoice"],
      [
        "payment invoice details",
        "fetchDetailPaymentInvoices",
        ACTION_TYPE.SEARCH_DETAIL_PAYMENT_INVOICE,
        "detailPaymentInvoice",
      ],
    ])("asks for a counted page of %s", (_label, creator, actionType, entity) => {
      const result = actions[creator](["first: 10", "isDeleted: false"]);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(first: 10,isDeleted: false) { totalCount`);
      expect(query(result)).toContain("edges { node {");
    });

    it.each([
      ["invoice", "fetchInvoice", ACTION_TYPE.GET_INVOICE],
      ["bill", "fetchBill", ACTION_TYPE.GET_BILL],
    ])("asks for a single %s without counting", (entity, creator, actionType) => {
      const result = actions[creator]([`id: "${entity}-1"`]);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(id: "${entity}-1") {`);
      expect(query(result)).not.toContain("totalCount");
    });

    it.each([
      ["invoice", "fetchInvoice", "dateInvoice", "dateBill"],
      ["bill", "fetchBill", "dateBill", "dateInvoice"],
    ])("requests the amounts, parties and dates of a %s", (_label, creator, ownDate, otherDate) => {
      const sent = query(actions[creator]([]));

      [
        "amountDiscount",
        "amountNet",
        "amountTotal",
        "taxAnalysis",
        "currencyCode",
        "status",
        "subjectTypeName",
        "subject",
        "thirdpartyTypeName",
        "thirdparty",
        "dateDue",
        "datePayed",
        ownDate,
      ].forEach((field) => expect(sent).toMatch(new RegExp(`[{,]${field}[,}\\s]`)));
      expect(sent).not.toContain(otherDate);
    });

    it.each([
      ["invoice", "fetchInvoiceLineItems"],
      ["bill", "fetchBillLineItems"],
    ])("requests how each %s line item was priced", (_label, creator) => {
      expect(query(actions[creator]([]))).toMatch(/[{,\s]unitPrice[,}\s]/);
    });

    it.each([
      ["invoice", "fetchInvoicePayments"],
      ["bill", "fetchBillPayments"],
    ])("requests the amount paid on each %s payment", (_label, creator) => {
      expect(query(actions[creator]([]))).toMatch(/[{,\s]amountPayed[,}\s]/);
    });

    it("requests the reconciliation state of each payment", () => {
      expect(query(actions.fetchPaymentInvoices([]))).toMatch(/[{,\s]reconciliationStatus[,}\s]/);
    });

    it("requests when each payment detail was reconciled", () => {
      expect(query(actions.fetchDetailPaymentInvoices([]))).toMatch(/[{,\s]reconciliationDate[,}\s]/);
    });

    it.each([
      ["invoice", "fetchInvoiceEvents"],
      ["bill", "fetchBillEvents"],
    ])("requests the type of each %s event", (_label, creator) => {
      expect(query(actions[creator]([]))).toMatch(/[{,\s]eventType[,}\s]/);
    });
  });

  describe("bill search filters", () => {
    it("sends the subject and third party type through the filters the bill query declares", () => {
      const sent = query(actions.fetchBills(['subjectType: "batchrun"', 'thirdpartyType: "healthfacility"', "first: 10"]));

      expect(sent).toContain('bill(subjectTypeFilter: "batchrun",thirdpartyTypeFilter: "healthfacility",first: 10)');
    });

    it("passes every other filter through unchanged", () => {
      const params = ['code_Icontains: "B-1"', "status: 1", "first: 10"];

      expect(query(actions.fetchBills(params))).toContain(`bill(${params.join(",")})`);
    });
  });

  describe("bill export", () => {
    it("asks for an export of the bills matching the filters", () => {
      const result = actions.fetchBillsExport(['status: 1', 'fields: ["code"]']);

      expect(result.type).toBe(ACTION_TYPE.BILL_EXPORT);
      expect(query(result)).toBe(' { billExport(status: 1,fields: ["code"]) }');
    });

    it.each([
      ["missing", undefined],
      ["empty", []],
    ])("asks for an unfiltered export when the filters are %s", (_label, params) => {
      expect(query(actions.fetchBillsExport(params))).toBe(" { billExport }");
    });
  });

  describe("mutation plumbing", () => {
    const MUTATIONS = [
      ["deleteInvoice", ACTION_TYPE.DELETE_INVOICE, () => actions.deleteInvoice({ id: "x" }, "label")],
      ["createInvoicePayment", ACTION_TYPE.CREATE_INVOICE_PAYMENT, () => actions.createInvoicePayment({}, "label")],
      ["updateInvoicePayment", ACTION_TYPE.UPDATE_INVOICE_PAYMENT, () => actions.updateInvoicePayment({}, "label")],
      ["deleteInvoicePayment", ACTION_TYPE.DELETE_INVOICE_PAYMENT, () => actions.deleteInvoicePayment({ id: "x" }, "label")],
      [
        "createInvoiceEventMessage",
        ACTION_TYPE.CREATE_INVOICE_EVENT_MESSAGE,
        () => actions.createInvoiceEventMessage({}, "label"),
      ],
      ["deleteBill", ACTION_TYPE.DELETE_BILL, () => actions.deleteBill({ id: "x" }, "label")],
      ["createBillPayment", ACTION_TYPE.CREATE_BILL_PAYMENT, () => actions.createBillPayment({}, "label")],
      ["updateBillPayment", ACTION_TYPE.UPDATE_BILL_PAYMENT, () => actions.updateBillPayment({}, "label")],
      ["deleteBillPayment", ACTION_TYPE.DELETE_BILL_PAYMENT, () => actions.deleteBillPayment({ id: "x" }, "label")],
      ["createBillEventType", ACTION_TYPE.CREATE_BILL_EVENT_MESSAGE, () => actions.createBillEventType({}, "label")],
      [
        "createPaymentWithDetailInvoice",
        ACTION_TYPE.CREATE_PAYMENT_INVOICE_WITH_DETAIL,
        () => actions.createPaymentInvoiceWithDetail({}, "inv-1", "invoice", "label"),
      ],
      ["deletePaymentInvoice", ACTION_TYPE.DELETE_PAYMENT_INVOICE, () => actions.deletePaymentInvoice({ id: "x" }, "label")],
    ];

    it.each(MUTATIONS)("sends %s under the shared mutation request and failure types", (mutationName, actionType, send) => {
      const result = send();

      expect(query(result)).toContain(`mutation ${mutationName} { ${mutationName}( input: {`);
      expect(result.type).toEqual([REQUEST(ACTION_TYPE.MUTATION), SUCCESS(actionType), ERROR(ACTION_TYPE.MUTATION)]);
    });

    it.each(MUTATIONS)("records what %s is so the searchers can refresh after it", (_name, actionType, send) => {
      const result = send();

      expect(result.meta).toMatchObject({ actionType, clientMutationLabel: "label" });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it.each(MUTATIONS)("reports the same client mutation id %s sends", (_name, _actionType, send) => {
      const result = send();

      expect(result.meta.clientMutationId).toMatch(/^[0-9a-f-]{36}$/);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
    });

    it.each([
      ["deleteInvoice", "an invoice"],
      ["deleteInvoicePayment", "an invoice payment"],
      ["deleteBill", "a bill"],
      ["deleteBillPayment", "a bill payment"],
      ["deletePaymentInvoice", "a payment"],
    ])("addresses %s to %s by its id", (creator) => {
      expect(query(actions[creator]({ id: "0a1b-2c3d" }, "label"))).toContain('uuids: ["0a1b-2c3d"]');
    });
  });

  describe("payments", () => {
    const FULL_PAYMENT = {
      status: PAYMENT_STATUS.ACCEPTED,
      codeExt: "EXT-1",
      label: "March premium",
      codeTp: "TP-1",
      codeReceipt: "RC-1",
      amountPayed: "120.00",
      fees: "2.50",
      amountReceived: "117.50",
      datePayment: "2026-03-01",
      paymentOrigin: "bank",
    };

    it.each([
      ["an invoice", "createInvoicePayment", "invoiceId"],
      ["a bill", "createBillPayment", "billId"],
    ])("sends every field of a new payment on %s", (_label, creator, parentField) => {
      const input = mutationInput(actions[creator]({ ...FULL_PAYMENT, [parentField]: "parent-1" }, "label"));

      expect(input).toContain(`${parentField}: "parent-1"`);
      expect(input).toContain("status: 1 ");
      expect(input).toContain('codeExt: "EXT-1"');
      expect(input).toContain('label: "March premium"');
      expect(input).toContain('codeTp: "TP-1"');
      expect(input).toContain('codeReceipt: "RC-1"');
      expect(input).toContain('amountPayed: "120.00"');
      expect(input).toContain('fees: "2.50"');
      expect(input).toContain('amountReceived: "117.50"');
      expect(input).toContain('datePayment: "2026-03-01"');
      expect(input).toContain('paymentOrigin: "bank"');
      expect(input).not.toContain(" id:");
    });

    it.each([
      ["an invoice", "updateInvoicePayment"],
      ["a bill", "updateBillPayment"],
    ])("addresses a payment update on %s by the payment id", (_label, creator) => {
      expect(mutationInput(actions[creator]({ ...FULL_PAYMENT, id: "pay-1" }, "label"))).toContain('id: "pay-1"');
    });

    it("sends a rejected status, whose code is zero", () => {
      expect(mutationInput(actions.createInvoicePayment({ status: PAYMENT_STATUS.REJECTED }, "label"))).toContain(
        "status: 0",
      );
    });

    it.each([
      ["an invoice", "createInvoicePayment"],
      ["a bill", "createBillPayment"],
    ])("leaves out the fields of a payment on %s that were not filled in", (_label, creator) => {
      const input = mutationInput(actions[creator]({ label: "only label", codeExt: null, fees: undefined }, "label"));

      expect(input).toMatch(/clientMutationLabel: "label" label: "only label" $/);
    });

    it("sends a new payment against the invoice or bill it settles", () => {
      const input = mutationInput(
        actions.createPaymentInvoiceWithDetail(
          {
            status: PAYMENT_STATUS.ACCEPTED,
            reconciliationStatus: PAYMENT_MAIN_STATUS.RECONCILIATED,
            codeExt: "EXT-1",
            label: "March premium",
            codeTp: "TP-1",
            codeReceipt: "RC-1",
            fees: "2.50",
            amountReceived: "117.50",
            datePayment: "2026-03-01",
            paymentOrigin: "bank",
            payerRef: "PAYER-1",
          },
          "inv-1",
          "invoice",
          "label",
        ),
      );

      expect(input).toContain('subjectId: "inv-1"');
      expect(input).toContain('subjectType: "invoice"');
      expect(input).toContain("status: 1 ");
      expect(input).toContain("reconciliationStatus: 1 ");
      expect(input).toContain('fees: "2.50"');
      expect(input).toContain('amountReceived: "117.50"');
      expect(input).toContain('datePayment: "2026-03-01"');
      expect(input).toContain('payerRef: "PAYER-1"');
      expect(input).toContain('codeReceipt: "RC-1"');
    });

    it("sends a rejected, unreconciled payment, whose codes are both zero", () => {
      const input = mutationInput(
        actions.createPaymentInvoiceWithDetail(
          { status: PAYMENT_STATUS.REJECTED, reconciliationStatus: PAYMENT_MAIN_STATUS.NOT_RECONCILIATED },
          "bill-1",
          "bill",
          "label",
        ),
      );

      expect(input).toContain("status: 0 ");
      expect(input).toContain("reconciliationStatus: 0 ");
      expect(input).toContain('subjectType: "bill"');
    });

    // Currently fails: the payment formatter has no line for payerName, so the payer
    // name the dialog requires is dropped from the mutation.
    it.fails("sends the payer name with a new payment", () => {
      const input = mutationInput(
        actions.createPaymentInvoiceWithDetail({ payerRef: "PAYER-1", payerName: "Jane Doe" }, "inv-1", "invoice", "label"),
      );

      expect(input).toContain('payerName: "Jane Doe"');
    });

    // Currently fails: every amount is gated on truthiness, so a zero is left out of the
    // mutation — a new payment is stored with no fee at all, and an update keeps the old one.
    it.fails.each([
      ["a new payment", () => actions.createPaymentInvoiceWithDetail({ fees: 0 }, "inv-1", "invoice", "label")],
      ["an invoice payment update", () => actions.updateInvoicePayment({ id: "pay-1", fees: 0 }, "label")],
      ["a bill payment update", () => actions.updateBillPayment({ id: "pay-1", fees: 0 }, "label")],
    ])("sends a fee of zero on %s", (_label, send) => {
      expect(mutationInput(send())).toContain('fees: "0"');
    });

    // Currently fails: text fields are interpolated without escaping, so a quote in a
    // payment label ends the GraphQL string early and the mutation is rejected.
    it.fails("keeps a quote inside a payment label", () => {
      const input = mutationInput(
        actions.createPaymentInvoiceWithDetail({ label: 'Ref "A"', payerRef: "P-1" }, "inv-1", "invoice", "label"),
      );

      expect(input).toContain('label: "Ref \\"A\\""');
    });
  });

  describe("event messages", () => {
    it.each([
      ["an invoice", "createInvoiceEventMessage", "invoiceId"],
      ["a bill", "createBillEventType", "billId"],
    ])("sends a message on %s with its type", (_label, creator, parentField) => {
      const input = mutationInput(
        actions[creator]({ [parentField]: "parent-1", eventType: EVENT_TYPE.MESSAGE, message: "Paid in cash" }, "label"),
      );

      expect(input).toContain(`${parentField}: "parent-1"`);
      expect(input).toContain("eventType: 0 ");
      expect(input).toContain('message: "Paid in cash"');
    });

    // Currently fails: the message is interpolated without escaping, so a quote or a line
    // break in what the user typed produces an invalid mutation and the message is lost.
    it.fails.each([
      ["an invoice", "createInvoiceEventMessage", "invoiceId"],
      ["a bill", "createBillEventType", "billId"],
    ])("keeps quotes and line breaks in a message on %s", (_label, creator, parentField) => {
      const sent = actions[creator](
        { [parentField]: "parent-1", eventType: EVENT_TYPE.MESSAGE, message: 'Client said "paid"\nsee receipt' },
        "label",
      ).payload;

      expect(sent).toContain('message: "Client said \\"paid\\"\\nsee receipt"');
    });
  });
});
