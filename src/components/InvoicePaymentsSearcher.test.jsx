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
vi.mock("../actions", () => ({ fetchPaymentInvoices: vi.fn(), deletePaymentInvoice: vi.fn() }));
vi.mock("./InvoicePaymentsFilter", () => ({ default: () => null }));
vi.mock("../pickers/PaymentInvoiceStatusPicker", () => ({ default: () => null }));

const { InvoicePaymentsSearcher } = await import("./InvoicePaymentsSearcher");
const { RIGHT_INVOICE_PAYMENT_DELETE } = await import("../constants");

const ROW = { id: "payment-1", label: "P1" };

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_INVOICE_PAYMENT_DELETE],
    paymentInvoices: [ROW],
    fetchPaymentInvoices: vi.fn(),
    deletePaymentInvoice: vi.fn(),
    coreConfirm: vi.fn(),
    journalize: vi.fn(),
    confirmed: null,
    invoice: { id: "invoice-1", code: "INV-1" },
  };
  const view = render(<InvoicePaymentsSearcher {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<InvoicePaymentsSearcher {...props} confirmed={confirmed} />);
  return { props, setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText("Delete").closest("button"));

describe("InvoicePaymentsSearcher delete", () => {
  it("deletes once and greys the row when its own dialog is confirmed", () => {
    const { props } = renderSearcher();

    clickDelete();
    expect(props.deletePaymentInvoice).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(props.deletePaymentInvoice).toHaveBeenCalledTimes(1);
    expect(props.deletePaymentInvoice.mock.calls[0][0]).toEqual(ROW);
    expect(screen.getByTestId("row-payment-1").dataset.disabled).toBe("true");
  });

  it("neither deletes nor greys the row when another dialog in the app is answered \"Yes\"", () => {
    const { props, setConfirmed } = renderSearcher();

    clickDelete();
    act(() => setConfirmed(true));

    expect(props.deletePaymentInvoice).not.toHaveBeenCalled();
    expect(screen.getByTestId("row-payment-1").dataset.disabled).toBe("false");
  });
});
