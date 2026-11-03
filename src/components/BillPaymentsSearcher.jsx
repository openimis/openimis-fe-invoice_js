import React, { useRef, useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { IconButton, Tooltip } from "@mui/material";
import { GetIconComponent } from "@openimis/fe-core";
const DeleteIcon = GetIconComponent("Delete")

import {
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  withModulesManager,
  coreConfirm,
} from "@openimis/fe-core";
import { fetchBillPayments, deleteBillPayment } from "../actions";
import { DEFAULT_PAGE_SIZE, EMPTY_STRING, RIGHT_BILL_PAYMENT_DELETE, ROWS_PER_PAGE_OPTIONS } from "../constants";
import { ACTION_TYPE } from "../reducer";
import BillPaymentsFilter from "./BillPaymentsFilter";

const BillPaymentsSearcher = ({
  intl,
  modulesManager,
  rights,
  bill,
  submittingMutation,
  mutation,
  coreConfirm,
  deleteBillPayment,
  fetchBillPayments,
  fetchingBillPayments,
  fetchedBillPayments,
  errorBillPayments,
  billPayments,
  billPaymentsPageInfo,
  billPaymentsTotalCount,
}) => {
  const [queryParams, setQueryParams] = useState([]);
  const [deletedBillPaymentUuids, setDeletedBillPaymentUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (
      prevSubmittingMutationRef.current &&
      !submittingMutation &&
      [ACTION_TYPE.CREATE_BILL_PAYMENT, ACTION_TYPE.UPDATE_BILL_PAYMENT].includes(mutation?.actionType)
    ) {
      refetch();
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  // Greying the row on state.core.confirmed also ran on any other dialog's
  // "Yes" (OP-3213); it now follows this dialog's answer only. The bound
  // deleteBillPayment prop is used: the bare import was never dispatched.
  const onDelete = (billPayment) =>
    coreConfirm(
      formatMessageWithValues(intl, "invoice", "billPayment.delete.confirm.title", {
        billPaymentLabel: billPayment?.label,
      }),
      formatMessage(intl, "invoice", "billPayment.delete.confirm.message"),
      {
        onConfirm: () => {
          deleteBillPayment(
            billPayment,
            formatMessageWithValues(intl, "invoice", "billPayment.delete.mutationLabel", {
              billPaymentLabel: billPayment?.label,
              billCode: bill?.code,
            }),
          );
          setDeletedBillPaymentUuids((uuids) => [...uuids, billPayment.id]);
        },
      },
    );

  const fetch = (params) => fetchBillPayments(params);

  const refetch = () => fetch(queryParams);

  const filtersToQueryParams = ({ filters, pageSize, beforeCursor, afterCursor, orderBy }) => {
    const queryParams = Object.keys(filters)
      .filter((f) => !!filters[f]["filter"])
      .map((f) => filters[f]["filter"]);
    !beforeCursor && !afterCursor && queryParams.push(`first: ${pageSize}`);
    if (afterCursor) {
      queryParams.push(`after: "${afterCursor}"`);
      queryParams.push(`first: ${pageSize}`);
    }
    if (beforeCursor) {
      queryParams.push(`before: "${beforeCursor}"`);
      queryParams.push(`last: ${pageSize}`);
    }
    orderBy && queryParams.push(`orderBy: ["${orderBy}"]`);
    setQueryParams(queryParams);
    return queryParams;
  };

  const headersSetter = () => {
    const headers = [
      "billPayment.codeExt",
      "billPayment.label",
      "billPayment.amountReceived",
      "billPayment.datePayment",
    ];

    const additionalHeaders = [
        "billPayment.codeTp",
        "billPayment.codeReceipt",
        "billPayment.fees",
        "billPayment.paymentOrigin",
      ];

    headers.push(...additionalHeaders);
    

    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (billPayment) => billPayment.codeExt,
      (billPayment) => billPayment.label,
      (billPayment) => billPayment.amountReceived,
      (billPayment) =>
        billPayment.datePayment ? formatDateFromISO(modulesManager, intl, billPayment.datePayment) : EMPTY_STRING,
    ];

    const additionalFormatters = [
        (billPayment) => billPayment.codeTp,
        (billPayment) => billPayment.codeReceipt,
        (billPayment) => billPayment.fees,
        (billPayment) => billPayment.paymentOrigin,
      ];

    formatters.push(...additionalFormatters);

    if (rights.includes(RIGHT_BILL_PAYMENT_DELETE)) {
      formatters.push((billPayment) => (
        <Tooltip title={formatMessage(intl, "invoice", "deleteButtonTooltip")}>
          <IconButton onClick={() => onDelete(billPayment)} disabled={deletedBillPaymentUuids.includes(billPayment.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }

    return formatters;
  };

  const sortsSetter = () => {
    const sortsArray = [
      ["codeExt", true],
      ["label", true],
      ["amountReceived", true],
      ["datePayment", true],
    ];

    const additionalSorts = [
        ["codeTp", true],
        ["codeReceipt", true],
        ["fees", true],
        ["paymentOrigin", true],
      ];

    sortsArray.push(...additionalSorts);

    return sortsArray;
  };

  const defaultFilters = () => ({
    subjectIds: {
      value: bill?.id,
      filter: `id: "${bill?.id}"`,
    },
    isDeleted: {
      value: false,
      filter: "isDeleted: false",
    },
  });

  const isRowDisabled = (_, billPayment) => deletedBillPaymentUuids.includes(billPayment.id);

  return (
    !!bill?.id && (
      <Searcher
        module="bill"
        FilterPane={BillPaymentsFilter}
        fetch={fetch}
        items={billPayments}
        itemsPageInfo={billPaymentsPageInfo}
        fetchingItems={fetchingBillPayments}
        fetchedItems={fetchedBillPayments}
        errorItems={errorBillPayments}
        tableTitle={formatMessageWithValues(intl, "invoice", "billPayments.searcherResultsTitle", {
          billPaymentsTotalCount,
        })}
        filtersToQueryParams={filtersToQueryParams}
        headers={headersSetter}
        itemFormatters={itemFormatters}
        sorts={sortsSetter}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="codeExt"
        defaultFilters={defaultFilters()}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
      />
    )
  );
};

const mapStateToProps = (state) => ({
  fetchingBillPayments: state.invoice.fetchingBillPayments,
  fetchedBillPayments: state.invoice.fetchedBillPayments,
  errorBillPayments: state.invoice.errorBillPayments,
  billPayments: state.invoice.billPayments,
  billPaymentsPageInfo: state.invoice.billPaymentsPageInfo,
  billPaymentsTotalCount: state.invoice.billPaymentsTotalCount,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchBillPayments,
      deleteBillPayment,
      coreConfirm,
    },
    dispatch,
  );
};

export { BillPaymentsSearcher };
export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BillPaymentsSearcher)));
