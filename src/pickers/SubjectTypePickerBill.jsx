import React, { useEffect } from "react";
import { SelectInput } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { SUBJECT_TYPE_OPTIONS_BILL } from "../constants";

const SubjectTypePickerBill = ({
  intl,
  value,
  label,
  onChange,
  readOnly = false,
  withNull = false,
  nullLabel = null,
  withLabel = true,
}) => {
  const options = SUBJECT_TYPE_OPTIONS_BILL;

  useEffect(() => {
    if (withNull) {
      options.unshift({
        value: null,
        label: nullLabel || formatMessage(intl, "bill", "emptyLabel"),
      });
    }
  }, []);

  return (
    <SelectInput
      module="bill"
      label={withLabel && label}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};

export default injectIntl(SubjectTypePickerBill);
