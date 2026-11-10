import React from "react";
import { describe, expect, it } from "vitest";
import { getSubjectAndThirdpartyTypePicker } from "./subject-and-thirdparty-picker";
import { INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_CONTRIBUTION_KEY } from "../constants";

const InsureePicker = () => null;
const PolicyHolderPicker = () => null;

const modulesManager = (contributions) => ({
  getContribs: (key) => (key === INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_CONTRIBUTION_KEY ? contributions : []),
});

// The backend serialises the object to a JSON string and graphene encodes that string again.
const asServerJson = (object) => JSON.stringify(JSON.stringify(object));

const INSUREE = {
  id: 7,
  chfId: "070707070",
  lastName: "Doe",
  otherNames: "Jane",
  family: { id: 3, uuid: "fam-3", address: "Main St" },
};

describe("getSubjectAndThirdpartyTypePicker", () => {
  it("renders the contributed picker, read only, for the object type", () => {
    const manager = modulesManager([
      { type: "policyholder", picker: PolicyHolderPicker, pickerProjection: ["code"] },
      { type: "insuree", picker: InsureePicker, pickerProjection: ["chfId"] },
    ]);
    const element = getSubjectAndThirdpartyTypePicker(manager, "insuree", asServerJson(INSUREE));

    expect(element.type).toBe(InsureePicker);
    expect(element.props.readOnly).toBe(true);
  });

  it("hands the picker only the properties it projects", () => {
    const manager = modulesManager([
      { type: "insuree", picker: InsureePicker, pickerProjection: ["chfId", "lastName", "otherNames"] },
    ]);

    expect(getSubjectAndThirdpartyTypePicker(manager, "insuree", asServerJson(INSUREE)).props.value).toEqual({
      chfId: "070707070",
      lastName: "Doe",
      otherNames: "Jane",
    });
  });

  it("narrows a nested property to the fields listed in braces", () => {
    const manager = modulesManager([
      { type: "insuree", picker: InsureePicker, pickerProjection: ["chfId", "family{uuid address}"] },
    ]);

    expect(getSubjectAndThirdpartyTypePicker(manager, "insuree", asServerJson(INSUREE)).props.value).toEqual({
      chfId: "070707070",
      family: { uuid: "fam-3", address: "Main St" },
    });
  });

  it("hands the picker an empty nested object when the object lacks that property", () => {
    const manager = modulesManager([{ type: "insuree", picker: InsureePicker, pickerProjection: ["family{uuid}"] }]);

    expect(getSubjectAndThirdpartyTypePicker(manager, "insuree", asServerJson({ chfId: "1" })).props.value).toEqual({
      family: {},
    });
  });

  it("hands the picker empty values when there is no object", () => {
    const manager = modulesManager([{ type: "insuree", picker: InsureePicker, pickerProjection: ["chfId"] }]);

    expect(getSubjectAndThirdpartyTypePicker(manager, "insuree", null).props.value).toEqual({ chfId: undefined });
  });

  it("hands the picker nothing when the contribution declares no projection", () => {
    const manager = modulesManager([{ type: "insuree", picker: InsureePicker }]);

    expect(getSubjectAndThirdpartyTypePicker(manager, "insuree", asServerJson(INSUREE)).props.value).toEqual({});
  });

  it.each([
    ["no module contributes a picker", []],
    ["only other types have pickers", [{ type: "policyholder", picker: PolicyHolderPicker }]],
    ["the contribution has no component", [{ type: "insuree", pickerProjection: ["chfId"] }]],
  ])("falls back to the type name when %s", (_label, contributions) => {
    expect(getSubjectAndThirdpartyTypePicker(modulesManager(contributions), "insuree", asServerJson(INSUREE))).toBe(
      "insuree",
    );
  });
});
