import React from "react";
import { SelectInput, injectIntl } from "@openimis/fe-core";
import { formatMessage } from "@openimis/fe-core";
import { THIRDPARTY_TYPE_OPTIONS } from "../constants";

const ThirdpartyTypePicker = ({
  intl,
  value,
  label,
  onChange,
  readOnly = false,
  withNull = false,
  nullLabel = null,
  withLabel = true,
}) => {
  const options = [
    ...(withNull
      ? [
          {
            value: null,
            label: nullLabel || formatMessage(intl, "invoice", "emptyLabel"),
          },
        ]
      : []),
    ...THIRDPARTY_TYPE_OPTIONS,
  ];

  return (
    <SelectInput
      module="invoice"
      label={withLabel && label}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};

export { ThirdpartyTypePicker };
export default injectIntl(ThirdpartyTypePicker);