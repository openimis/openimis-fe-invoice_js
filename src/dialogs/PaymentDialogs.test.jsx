import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// NumberInput imports fe-core's own barrel, so it is loaded after this stub is in place.
const lazy = vi.hoisted(() => ({ NumberInput: null }));
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, types, meta) => ({ type: "GRAPHQL", payload, types, meta })),
}));

// fe-core's barrel imports itself, so the real pieces come from their defining modules.
vi.mock("@openimis/fe-core", async () => {
  const api = await vi.importActual("@openimis/fe-core/helpers/api");
  const i18n = await vi.importActual("@openimis/fe-core/helpers/i18n");
  const icons = await vi.importActual("@openimis/fe-core/helpers/icons");
  const modules = await vi.importActual("@openimis/fe-core/helpers/modules");
  const selectInput = await vi.importActual("@openimis/fe-core/components/inputs/SelectInput");
  const textInput = await vi.importActual("@openimis/fe-core/components/inputs/TextInput");
  const formattedMessage = await vi.importActual("@openimis/fe-core/components/generics/FormattedMessage");
  const publishedComponent = await vi.importActual("@openimis/fe-core/components/generics/PublishedComponent");
  return {
    ...api,
    ...core,
    formatMessage: i18n.formatMessage,
    formatMessageWithValues: i18n.formatMessageWithValues,
    GetIconComponent: icons.default,
    withModulesManager: modules.default,
    SelectInput: selectInput.default,
    TextInput: textInput.default,
    FormattedMessage: formattedMessage.default,
    PublishedComponent: publishedComponent.default,
    get NumberInput() {
      return lazy.NumberInput;
    },
  };
});

lazy.NumberInput = (await import("@openimis/fe-core/components/inputs/NumberInput")).default;
const { default: InvoicePaymentDialog } = await import("./InvoicePaymentDialog");
const { default: BillPaymentDialog } = await import("./BillPaymentDialog");
const { ACTION_TYPE } = await import("../reducer");
const { SUCCESS } = await import("../util/action-type");
const { makeStore, mockModulesManager, renderWithProviders, screen, userEvent, waitFor } = await import(
  "@openimis/fe-core/testing"
);

const messages = {
  "invoice.dialog.create": "Create",
  "invoice.dialog.update": "Update",
  "invoice.dialog.cancel": "Cancel",
  "invoice.paymentInvoice.payerRef": "Payer reference",
  "invoice.paymentInvoice.payerName": "Payer name",
  "invoice.paymentInvoice.codeExt": "External code",
  "invoice.paymentInvoice.label": "Label",
  "invoice.paymentInvoice.codeTp": "Third party code",
  "invoice.paymentInvoice.codeReceipt": "Receipt code",
  "invoice.paymentInvoice.fees": "Fees",
  "invoice.paymentInvoice.amountReceived": "Amount received",
  "invoice.paymentInvoice.paymentOrigin": "Payment origin",
  "invoice.paymentInvoice.reconciliationStatus.RECONCILIATED": "Reconciliated",
  "invoice.invoicePayment.status.ACCEPTED": "Accepted",
};

const PAYMENT = {
  id: "pay-1",
  status: "1",
  reconciliationStatus: "1",
  payerRef: "PAYER-1",
  payerName: "Jane Doe",
  codeExt: "EXT-1",
  label: "March premium",
  codeTp: "TP-1",
  codeReceipt: "RC-1",
  fees: "2.50",
  amountReceived: "117.50",
  datePayment: "2026-03-01",
  paymentOrigin: "bank",
};

const DatePicker = ({ value, onChange, label }) => (
  <input aria-label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
);
const modulesManager = mockModulesManager({ getRef: (ref) => (ref === "core.DatePicker" ? DatePicker : null) });

const DIALOGS = [
  ["InvoicePaymentDialog", InvoicePaymentDialog, "invoice", "invoicePayment"],
  ["BillPaymentDialog", BillPaymentDialog, "bill", "billPayment"],
];

const open = async () => userEvent.click(screen.getByRole("button"));

const choose = async (combobox, option) => {
  await userEvent.click(combobox);
  await userEvent.click(screen.getByRole("option", { name: option }));
};

const fillNewPayment = async () => {
  // The selects have no accessible name (fe-core's SelectInput), so they are taken in order.
  const [reconciliationStatus, status] = screen.getAllByRole("combobox");
  await choose(reconciliationStatus, "Reconciliated");
  await choose(status, "Accepted");
  for (const [label, value] of [
    ["Payer reference", "PAYER-1"],
    ["Payer name", "Jane Doe"],
    ["External code", "EXT-1"],
    ["Label", "March premium"],
    ["Third party code", "TP-1"],
    ["Receipt code", "RC-1"],
    ["Fees", "2.5"],
    ["Amount received", "117.5"],
    ["paymentInvoice.datePayment", "2026-03-01"],
    ["Payment origin", "bank"],
  ]) {
    await userEvent.type(screen.getByRole("textbox", { name: label }), value);
  }
};

// Only the warnings these components are known to raise are tolerated; anything else fails the test.
const KNOWN_CONSOLE_NOISE = [
  // fe-core's TextInput spreads its connected props, dispatch included, onto the DOM.
  /^Warning: React does not recognize the `%s` prop on a DOM element\..* maxLengthConstraints /s,
  /^Warning: Invalid value for prop %s on <%s> tag\..* `dispatch` /s,
  // The invoice dialog passes Grid the v1 `item`/`xs` props MUI v7 removed.
  /^MUI Grid: The `(item|xs)` prop has been removed/,
];
let unexpectedConsole;

beforeEach(() => {
  core.graphql.mockClear();
  unexpectedConsole = [];
  const record = (...args) => {
    const text = args.map(String).join(" ");
    if (!KNOWN_CONSOLE_NOISE.some((pattern) => pattern.test(text))) unexpectedConsole.push(text.split("\n")[0]);
  };
  vi.spyOn(console, "error").mockImplementation(record);
  vi.spyOn(console, "warn").mockImplementation(record);
});

afterEach(() => {
  expect(unexpectedConsole).toEqual([]);
});

describe.each(DIALOGS)("%s", (_name, Dialog, parent, paymentProp) => {
  const renderDialog = (payment) => {
    const store = makeStore();
    vi.spyOn(store, "dispatch");
    const props = { [parent]: { id: `${parent}-1`, code: "C-1" }, ...(payment ? { [paymentProp]: payment } : {}) };
    renderWithProviders(<Dialog {...props} />, { store, messages, modulesManager });
    return store;
  };

  describe("recording a new payment", () => {
    it("opens an empty form that cannot be submitted yet", async () => {
      renderDialog();
      await open();

      expect(screen.getByRole("textbox", { name: "Payer reference" })).toHaveValue("");
      expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    });

    it("closes without sending anything when cancelled", async () => {
      const store = renderDialog();
      await open();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(core.graphql).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "GRAPHQL" }));
    });

    it(`sends a filled-in payment against the ${parent}`, async () => {
      const store = renderDialog();
      await open();
      await fillNewPayment();
      await userEvent.click(screen.getByRole("button", { name: "Create" }));

      expect(core.graphql).toHaveBeenCalledOnce();
      const [payload, types] = core.graphql.mock.calls[0];
      const sent = payload.replace(/\s+/g, " ");
      expect(types).toContain(SUCCESS(ACTION_TYPE.CREATE_PAYMENT_INVOICE_WITH_DETAIL));
      expect(sent).toContain(`subjectId: "${parent}-1"`);
      expect(sent).toContain(`subjectType: "${parent}"`);
      expect(sent).toContain("status: 1 ");
      expect(sent).toContain("reconciliationStatus: 1 ");
      expect(sent).toContain('payerRef: "PAYER-1"');
      expect(sent).toContain('amountReceived: "117.5"');
      expect(sent).toContain('datePayment: "2026-03-01"');
      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "GRAPHQL" }));
    });
  });

  describe("editing a payment", () => {
    it("opens with the payment's values and allows saving them", async () => {
      renderDialog(PAYMENT);
      await open();

      expect(screen.getByRole("textbox", { name: "Payer reference" })).toHaveValue("PAYER-1");
      expect(screen.getByRole("textbox", { name: "Label" })).toHaveValue("March premium");
      expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
    });

    it("cannot be saved while a field is empty", async () => {
      renderDialog({ ...PAYMENT, payerRef: "" });
      await open();

      expect(screen.getByRole("button", { name: "Update" })).toBeDisabled();
    });

    // Currently fails: the component destructures the dispatching prop as updatePaymentInvoice
    // but calls the imported action creator, so the mutation is built and thrown away.
    it.fails("sends the update to the server", async () => {
      const store = renderDialog(PAYMENT);
      await open();
      await userEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "GRAPHQL" }));
    });

    // Currently fails: saving requires every field to be truthy, so a payment whose fees
    // are zero can never be saved.
    it.fails("can be saved when the payment carried no fees", async () => {
      renderDialog({ ...PAYMENT, fees: 0 });
      await open();

      expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
    });
  });
});
