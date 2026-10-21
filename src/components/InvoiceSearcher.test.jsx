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
vi.mock("../actions", () => ({ fetchInvoices: vi.fn(), deleteInvoice: vi.fn() }));
vi.mock("./InvoiceFilter", () => ({ default: () => null }));
vi.mock("../pickers/InvoiceStatusPicker", () => ({ default: () => null }));
vi.mock("../util/subject-and-thirdparty-picker", () => ({ getSubjectAndThirdpartyTypePicker: () => null }));

const { InvoiceSearcher } = await import("./InvoiceSearcher");
const { RIGHT_INVOICE_DELETE } = await import("../constants");

const ROW = { id: "invoice-1", code: "INV-1", status: 0 };

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_INVOICE_DELETE],
    invoices: [ROW],
    fetchInvoices: vi.fn(),
    deleteInvoice: vi.fn(),
    coreConfirm: vi.fn(),
    journalize: vi.fn(),
    confirmed: null,
  };
  const view = render(<InvoiceSearcher {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<InvoiceSearcher {...props} confirmed={confirmed} />);
  return { props, setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText("Delete").closest("button"));

describe("InvoiceSearcher delete", () => {
  it("deletes once and greys the row when its own dialog is confirmed", () => {
    const { props } = renderSearcher();

    clickDelete();
    expect(props.deleteInvoice).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(props.deleteInvoice).toHaveBeenCalledTimes(1);
    expect(props.deleteInvoice.mock.calls[0][0]).toEqual(ROW);
    expect(screen.getByTestId("row-invoice-1").dataset.disabled).toBe("true");
  });

  it("neither deletes nor greys the row when another dialog in the app is answered \"Yes\"", () => {
    const { props, setConfirmed } = renderSearcher();

    clickDelete();
    act(() => setConfirmed(true));

    expect(props.deleteInvoice).not.toHaveBeenCalled();
    expect(screen.getByTestId("row-invoice-1").dataset.disabled).toBe("false");
  });
});
