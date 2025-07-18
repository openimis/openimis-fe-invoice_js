import React from "react";
import { SelectInput } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { EVENT_TYPE } from "../constants";

const InvoiceEventTypePicker = ({
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
  const options = Object.keys(EVENT_TYPE).map((key) => ({
    value: EVENT_TYPE[key],
    label: formatMessage(intl, "invoice", `invoiceEvent.eventType.${key}`),
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

export default injectIntl(InvoiceEventTypePicker);
