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
vi.mock("../actions", () => ({ fetchBillPayments: vi.fn(), deleteBillPayment: vi.fn() }));
vi.mock("./BillPaymentsFilter", () => ({ default: () => null }));

const { BillPaymentsSearcher } = await import("./BillPaymentsSearcher");
const { RIGHT_BILL_PAYMENT_DELETE } = await import("../constants");

const ROW = { id: "payment-1", label: "P1" };

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_BILL_PAYMENT_DELETE],
    billPayments: [ROW],
    fetchBillPayments: vi.fn(),
    deleteBillPayment: vi.fn(),
    coreConfirm: vi.fn(),
    journalize: vi.fn(),
    confirmed: null,
    bill: { id: "bill-1", code: "BILL-1" },
  };
  const view = render(<BillPaymentsSearcher {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<BillPaymentsSearcher {...props} confirmed={confirmed} />);
  return { props, setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText("Delete").closest("button"));

describe("BillPaymentsSearcher delete", () => {
  it("deletes once and greys the row when its own dialog is confirmed", () => {
    const { props } = renderSearcher();

    clickDelete();
    expect(props.deleteBillPayment).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(props.deleteBillPayment).toHaveBeenCalledTimes(1);
    expect(props.deleteBillPayment.mock.calls[0][0]).toEqual(ROW);
    expect(screen.getByTestId("row-payment-1").dataset.disabled).toBe("true");
  });

  it("neither deletes nor greys the row when another dialog in the app is answered \"Yes\"", () => {
    const { props, setConfirmed } = renderSearcher();

    clickDelete();
    act(() => setConfirmed(true));

    expect(props.deleteBillPayment).not.toHaveBeenCalled();
    expect(screen.getByTestId("row-payment-1").dataset.disabled).toBe("false");
  });
});
