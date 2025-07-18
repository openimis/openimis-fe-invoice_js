import React from "react";
import { SelectInput } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { PAYMENT_STATUS } from "../constants";

const InvoicePaymentStatusPicker = ({
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
  const options = Object.keys(PAYMENT_STATUS).map((key) => ({
    value: PAYMENT_STATUS[key],
    label: formatMessage(intl, "invoice", `invoicePayment.status.${key}`),
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

export default injectIntl(InvoicePaymentStatusPicker);
