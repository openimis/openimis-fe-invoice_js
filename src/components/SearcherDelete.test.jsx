/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@openimis/fe-core", () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  formatMessage: (intl, module, key) => key,
  formatMessageWithValues: (intl, module, key) => key,
  formatDateFromISO: () => "",
  withModulesManager: (component) => component,
  withHistory: (component) => component,
  historyPush: vi.fn(),
  coreConfirm: vi.fn(),
  journalize: vi.fn(),
  // One row per item, each cell from the searcher's formatters.
  Searcher: function Searcher({ items, itemFormatters, rowDisabled }) {
    return (
      <table>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} data-testid={`row-${item.id}`} data-disabled={String(!!rowDisabled(null, item))}>
              {itemFormatters().map((format, i) => <td key={i}>{format(item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock("../reducer", () => ({ ACTION_TYPE: {} }));
vi.mock("../actions", () => ({
  fetchInvoices: vi.fn(),
  deleteInvoice: vi.fn(),
  fetchPaymentInvoices: vi.fn(),
  deletePaymentInvoice: vi.fn(),
  fetchBillPayments: vi.fn(),
  deleteBillPayment: vi.fn(),
}));
vi.mock("./InvoiceFilter", () => ({ default: () => null }));
vi.mock("./InvoicePaymentsFilter", () => ({ default: () => null }));
vi.mock("./BillPaymentsFilter", () => ({ default: () => null }));
vi.mock("../pickers/InvoiceStatusPicker", () => ({ default: () => null }));
vi.mock("../pickers/PaymentInvoiceStatusPicker", () => ({ default: () => null }));
vi.mock("../util/subject-and-thirdparty-picker", () => ({ getSubjectAndThirdpartyTypePicker: () => null }));

const { InvoiceSearcher } = await import("./InvoiceSearcher");
const { InvoicePaymentsSearcher } = await import("./InvoicePaymentsSearcher");
const { BillPaymentsSearcher } = await import("./BillPaymentsSearcher");
const { RIGHT_INVOICE_DELETE, RIGHT_INVOICE_PAYMENT_DELETE, RIGHT_BILL_PAYMENT_DELETE } = await import("../constants");

// Each searcher with the props it lists and deletes from.
const SEARCHERS = [
  {
    name: "InvoiceSearcher",
    Component: InvoiceSearcher,
    right: RIGHT_INVOICE_DELETE,
    row: { id: "invoice-1", code: "INV-1", status: 0 },
    itemsProp: "invoices",
    fetchProp: "fetchInvoices",
    deleteProp: "deleteInvoice",
    extraProps: {},
  },
  {
    name: "InvoicePaymentsSearcher",
    Component: InvoicePaymentsSearcher,
    right: RIGHT_INVOICE_PAYMENT_DELETE,
    row: { id: "payment-1", label: "P1" },
    itemsProp: "paymentInvoices",
    fetchProp: "fetchPaymentInvoices",
    deleteProp: "deletePaymentInvoice",
    extraProps: { invoice: { id: "invoice-1", code: "INV-1" } },
  },
  {
    name: "BillPaymentsSearcher",
    Component: BillPaymentsSearcher,
    right: RIGHT_BILL_PAYMENT_DELETE,
    row: { id: "payment-1", label: "P1" },
    itemsProp: "billPayments",
    fetchProp: "fetchBillPayments",
    deleteProp: "deleteBillPayment",
    extraProps: { bill: { id: "bill-1", code: "BILL-1" } },
  },
];

const renderSearcher = ({ Component, right, row, itemsProp, fetchProp, deleteProp, extraProps }) => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [right],
    [itemsProp]: [row],
    [fetchProp]: vi.fn(),
    [deleteProp]: vi.fn(),
    coreConfirm: vi.fn(),
    journalize: vi.fn(),
    confirmed: null,
    ...extraProps,
  };
  const view = render(<Component {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<Component {...props} confirmed={confirmed} />);
  return { props, deleteAction: props[deleteProp], setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText("Delete").closest("button"));

describe.each(SEARCHERS)("$name delete", (searcher) => {
  const rowState = () => screen.getByTestId(`row-${searcher.row.id}`).dataset.disabled;

  it("deletes once and greys the row when its own dialog is confirmed", () => {
    const { props, deleteAction } = renderSearcher(searcher);

    clickDelete();
    expect(deleteAction).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(deleteAction).toHaveBeenCalledTimes(1);
    expect(deleteAction.mock.calls[0][0]).toEqual(searcher.row);
    expect(rowState()).toBe("true");
  });

  it("neither deletes nor greys the row when another dialog in the app is answered \"Yes\"", () => {
    const { deleteAction, setConfirmed } = renderSearcher(searcher);

    clickDelete();
    act(() => setConfirmed(true));

    expect(deleteAction).not.toHaveBeenCalled();
    expect(rowState()).toBe("false");
  });
});
