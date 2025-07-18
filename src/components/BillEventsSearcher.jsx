import React, { useRef, useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { formatMessageWithValues, Searcher } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchBillEvents } from "../actions";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS} from "../constants";
import BillEventsFilter from "./BillEventsFilter";
import InvoiceEventTypePicker from "../pickers/InvoiceEventTypePicker"
import { ACTION_TYPE } from "../reducer";

const BillEventsSearcher = ({
  intl,
  bill,
  submittingMutation,
  mutation,
  fetchBillEvents,
  fetchingBillEvents,
  fetchedBillEvents,
  errorBillEvents,
  billEvents,
  billEventsPageInfo,
  billEventsTotalCount,
}) => {
  const [queryParams, setQueryParams] = useState([]);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (
      prevSubmittingMutationRef.current &&
      !submittingMutation &&
      mutation?.actionType === ACTION_TYPE.CREATE_BILL_EVENT_MESSAGE
    ) {
      refetch();
    }
  }, [submittingMutation]);
  
  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchBillEvents(params);

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

  const headers = () => [
    "billEvent.eventType.label",
    "billEvent.message",
  ];

  const itemFormatters = () => [
    (billEvent) => <InvoiceEventTypePicker value={billEvent?.eventType} readOnly />,
    (billEvent) => billEvent.message,
  ];

  const sorts = () => [
    ["eventType", true],
    ["message", true],
  ];

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
        module="invoice"
        FilterPane={BillEventsFilter}
        fetch={fetch}
        items={billEvents}
        itemsPageInfo={billEventsPageInfo}
        fetchingItems={fetchingBillEvents}
        fetchedItems={fetchedBillEvents}
        errorItems={errorBillEvents}
        tableTitle={formatMessageWithValues(intl, "invoice", "billEvents.searcherResultsTitle", {
          billEventsTotalCount,
        })}
        filtersToQueryParams={filtersToQueryParams}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="eventType"
        defaultFilters={defaultFilters()}
      />
    )
  );
};

const mapStateToProps = (state) => ({
  fetchingBillEvents: state.invoice.fetchingBillEvents,
  fetchedBillEvents: state.invoice.fetchedBillEvents,
  errorBillEvents: state.invoice.errorBillEvents,
  billEvents: state.invoice.billEvents,
  billEventsPageInfo: state.invoice.billEventsPageInfo,
  billEventsTotalCount: state.invoice.billEventsTotalCount,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchBillEvents }, dispatch);

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(BillEventsSearcher));
