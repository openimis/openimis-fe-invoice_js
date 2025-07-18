import React from "react";
import _pick from "lodash/pick";
import {
  INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_CONTRIBUTION_KEY,
  INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_PROPS,
  PICKER_NESTED_PROPERTY_REGEX,
  PICKER_NESTED_PROPERTY_NAME_REGEX,
  PICKER_NESTED_PROPERTY_PROJECTION_REGEX,
} from "../constants";

const getSubjectAndThirdpartyTypePickerContribution = (modulesManager, type) =>
  modulesManager
    .getContribs(INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_CONTRIBUTION_KEY)
    .find((pickerComponent) => pickerComponent?.[INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_PROPS.TYPE] === type);

export const getSubjectAndThirdpartyTypePicker = (modulesManager, objectTypeName, objectJson) => {
  const contribution = getSubjectAndThirdpartyTypePickerContribution(modulesManager, objectTypeName);
  const Picker = contribution?.[INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_PROPS.PICKER];
  const object = objectJson ? JSON.parse(JSON.parse(objectJson)) : {};
  const projection = contribution?.[INVOICE_SUBJECT_AND_THIRDPARTY_PICKER_PROPS.PICKER_PROJECTION];
  const value = {};
  projection?.forEach((property) => {
    if (!!property.match(PICKER_NESTED_PROPERTY_REGEX)) {
      const propertyName = property.match(PICKER_NESTED_PROPERTY_NAME_REGEX)?.[0];
      /**
       * separate a projection from a property name, then remove curly brackets around the string
       * and split the string using whitespace separator to get an array of projection property names
       */
      const propertyProjection = property.match(PICKER_NESTED_PROPERTY_PROJECTION_REGEX)?.[0].slice(1, -1).split(" ");
      value[propertyName] = _pick(object[propertyName], propertyProjection);
    } else {
      value[property] = object[property];
    }
  });
  return !!Picker ? <Picker value={value} readOnly /> : objectTypeName;
};
