import React from "react";
import { SelectInput } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { PAYMENT_MAIN_STATUS } from "../constants";

const PaymentInvoiceStatusPicker = ({
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
  const options = Object.keys(PAYMENT_MAIN_STATUS).map((key) => ({
    value: PAYMENT_MAIN_STATUS[key],
    label: formatMessage(intl, "invoice", `paymentInvoice.reconciliationStatus.${key}`),
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

export default injectIntl(PaymentInvoiceStatusPicker);
