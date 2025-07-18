import React from "react";
import { SelectInput } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { STATUS } from "../constants";

const InvoiceStatusPicker = ({
  intl,
  value,
  label,
  onChange,
  readOnly = false,
  withNull = false,
  nullLabel = null,
  withLabel = true,
  required = false,
}) => {
  const options = Object.keys(STATUS).map((key) => ({
    value: STATUS[key],
    label: formatMessage(intl, "invoice", `invoice.status.${key}`),
  }));

  if (withNull) {
    options.unshift({
      value: null,
      label: nullLabel || formatMessage(intl, "invoice", "emptyLabel"),
    });
  }

  return (
    <SelectInput
      module="invoice"
      label={withLabel && label}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
    />
  );
};

export default injectIntl(InvoiceStatusPicker);
