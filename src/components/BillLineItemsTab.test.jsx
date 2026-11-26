import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@openimis/fe-core/testing";
import { BILL_LINE_ITEMS_TAB_VALUE } from "../constants";
import { BillLineItemsTabPanel } from "./BillLineItemsTab";

// A modules manager with fe-core's refs only: PolicyHolderModule is not installed,
// so policyHolder.TabPanel is not registered.
const { refs } = vi.hoisted(() => ({ refs: {} }));

vi.mock("@openimis/fe-core", async () => {
  const ReactActual = (await import("react")).default;
  refs["core.TabPanel"] = ({ value, index, children }) =>
    value === index ? ReactActual.createElement("div", { "data-testid": "core-tab-panel" }, children) : null;
  return {
    formatMessage: (intl, module, id) => id,
    PublishedComponent: ({ pubRef, ...props }) => {
      const Component = refs[pubRef];
      return Component ? ReactActual.createElement(Component, props) : null;
    },
  };
});

vi.mock("./BillLineItemsSearcher", () => ({
  default: ({ bill }) => <div data-testid="bill-line-items-searcher">{bill.id}</div>,
}));

describe("BillLineItemsTabPanel", () => {
  it("renders its content through core.TabPanel without PolicyHolderModule", () => {
    renderWithProviders(<BillLineItemsTabPanel value={BILL_LINE_ITEMS_TAB_VALUE} bill={{ id: "bill-1" }} />);

    expect(screen.getByTestId("bill-line-items-searcher")).toHaveTextContent("bill-1");
  });
});
