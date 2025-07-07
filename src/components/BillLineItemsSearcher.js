import React from "react";
import { injectIntl } from "react-intl";
import { formatMessageWithValues, Searcher, withHistory } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchBillLineItems } from "../actions";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from "../constants";
import { Tooltip } from "@material-ui/core";
import BillLineItemsFilter from "./BillLineItemsFilter";

const BillLineItemsSearcher = ({
  intl,
  bill,
  fetchBillLineItems,
  fetchingBillLineItems,
  fetchedBillLineItems,
  errorBillLineItems,
  billLineItems,
  billLineItemsPageInfo,
  billLineItemsTotalCount,
  isWorker,
}) => {
  const fetch = (params) => fetchBillLineItems(params);

  const headersSetter = () => {
    const headers = ["billItem.code", "billItem.description", "billItem.quantity", "billItem.amountTotal"];

    if (!isWorker) {
      const additionalHeaders = [
        "billItem.ledgerAccount",
        "billItem.unitPrice",
        "billItem.discount",
        "billItem.deduction",
        "billItem.amountNet",
      ];

      headers.push(...additionalHeaders);
    }

    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (billItem) => billItem.code,
      (billItem) => billItem.description,
      (billItem) => billItem.quantity,
      (billItem) => billItem.amountTotal,
    ];

    if (!isWorker) {
      const additionalFormatters = [
        (billItem) => billItem.ledgerAccount,
        (billItem) => billItem.unitPrice,
        (billItem) => billItem.discount,
        (billItem) => billItem.deduction,
        (billItem) => (
          <Tooltip
            title={formatMessageWithValues(intl, "invoice", "billItem.amountNetTooltip", {
              value: !!billItem?.taxAnalysis ? JSON.parse(billItem.taxAnalysis)?.["total"] : null,
            })}
            placement="right"
          >
            <div>{billItem.amountNet}</div>
          </Tooltip>
        ),
      ];

      formatters.push(...additionalFormatters);
    }

    return formatters;
  };

  const sortsSetter = () => {
    const sorts = [
      ["code", true],
      ["description", true],
      ["quantity", true],
      ["amountTotal", true],
    ];

    if (!isWorker) {
      const additionalSorts = [
        ["ledgerAccount", true],
        ["unitPrice", true],
        ["discount", true],
        ["deduction", true],
        ["amountNet", true],
      ];

      sorts.push(...additionalSorts);
    }

    return sorts;
  };

  const defaultFilters = () => ({
    bill_Id: {
      value: bill?.id,
      filter: `bill_Id: "${bill?.id}"`,
    },
    isDeleted: {
      value: false,
      filter: "isDeleted: false",
    },
  });
  return (
    !!bill?.id && (
      <Searcher
        module="bill"
        FilterPane={BillLineItemsFilter}
        fetch={fetch}
        items={billLineItems}
        itemsPageInfo={billLineItemsPageInfo}
        fetchingItems={fetchingBillLineItems}
        fetchedItems={fetchedBillLineItems}
        errorItems={errorBillLineItems}
        tableTitle={formatMessageWithValues(intl, "invoice", "billItems.searcher.resultsTitle", {
          billLineItemsTotalCount,
        })}
        headers={headersSetter}
        itemFormatters={itemFormatters}
        sorts={sortsSetter}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="code"
        defaultFilters={defaultFilters()}
      />
    )
  );
};

const mapStateToProps = (state) => ({
  fetchingBillLineItems: state.invoice.fetchingBillLineItems,
  fetchedBillLineItems: state.invoice.fetchedBillLineItems,
  errorBillLineItems: state.invoice.errorBillLineItems,
  billLineItems: state.invoice.billLineItems,
  billLineItemsPageInfo: state.invoice.billLineItemsPageInfo,
  billLineItemsTotalCount: state.invoice.billLineItemsTotalCount,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchBillLineItems,
    },
    dispatch,
  );
};

export default withHistory(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BillLineItemsSearcher)));
