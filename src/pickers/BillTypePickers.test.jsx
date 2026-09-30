import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => {
  const selectInput = await vi.importActual("@openimis/fe-core/components/inputs/SelectInput");
  const i18n = await vi.importActual("@openimis/fe-core/helpers/i18n");
  return { SelectInput: selectInput.default, formatMessage: i18n.formatMessage };
});

const { renderWithProviders, screen, userEvent } = await import("@openimis/fe-core/testing");

const messages = {
  "bill.subject": "Subject",
  "bill.thirdparty": "Third party",
  "bill.emptyLabel": "None",
};

const PICKERS = [
  [
    "SubjectTypePickerBill",
    () => import("./SubjectTypePickerBill"),
    "subject",
    ["Batch Run", "Policy"],
    "policy",
    "Policy",
  ],
  [
    "ThirdPartyTypePickerBill",
    () => import("./ThirdPartyTypePickerBill"),
    "thirdparty",
    ["Health Facility", "Insuree", "Payer", "User"],
    "payer",
    "Payer",
  ],
];

// The pickers write into a module-level constant, so each test loads a fresh copy.
let Picker;
const load = async (importPicker) => {
  vi.resetModules();
  Picker = (await importPicker()).default;
};

const renderPicker = (label, props = {}) =>
  renderWithProviders(<Picker label={label} onChange={() => {}} {...props} />, { messages });

const openOptions = async () => {
  await userEvent.click(screen.getByRole("combobox"));
  return screen.getAllByRole("option").map((option) => option.textContent);
};

describe.each(PICKERS)("%s", (_name, importPicker, label, choices, value, choiceLabel) => {
  beforeEach(() => load(importPicker));

  it("offers every type a bill can have", async () => {
    renderPicker(label);

    expect(await openOptions()).toEqual(choices);
  });

  it("reports the chosen type by its model name", async () => {
    const onChange = vi.fn();
    renderPicker(label, { onChange });

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: choiceLabel }));

    expect(onChange).toHaveBeenCalledWith(value);
  });

  it("labels itself from the bill translations", () => {
    renderPicker(label);

    expect(screen.getByText(messages[`bill.${label}`], { selector: "label" })).toBeInTheDocument();
  });

  // Currently fails: the empty choice is unshifted in a useEffect, after the options
  // have already been rendered, so the first picker on screen never shows it.
  it.fails("offers an empty choice when one is allowed", async () => {
    renderPicker(label, { withNull: true, nullLabel: "Any" });

    expect(await openOptions()).toEqual(["Any", ...choices]);
  });

  // Currently fails: the empty choice is unshifted into the shared options constant on
  // every mount, so each visit to a screen with the picker adds another one.
  it.fails("offers a single empty choice however many times it has been shown", async () => {
    renderPicker(label, { withNull: true, nullLabel: "Any" }).unmount();
    renderPicker(label, { withNull: true, nullLabel: "Any" }).unmount();
    renderPicker(label, { withNull: true, nullLabel: "Any" });

    expect(await openOptions()).toEqual(["Any", ...choices]);
  });
});
