import React, { useState, useCallback, useEffect, useRef } from "react";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { IconButton, Tooltip, Button, Dialog, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from "@material-ui/icons/Delete";

import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  coreConfirm,
  journalize,
  withHistory,
  historyPush,
  downloadExport,
  decodeId,
} from "@openimis/fe-core";
import { fetchBills, deleteBill, fetchBillsExport } from "../actions";
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
  RIGHT_BILL_SEARCH,
  RIGHT_BILL_DELETE,
  STATUS,
  DEFAULT,
  INSPECTOR_RIGHT,
  ADMIN_RIGHT,
} from "../constants";
import BillFilter from "./BillFilter";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";
import { getSubjectAndThirdpartyTypePicker } from "../util/subject-and-thirdparty-picker";

const BillSearcher = ({
  intl,
  modulesManager,
  history,
  rights,
  coreConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  fetchBills,
  fetchBillsExport,
  deleteBill,
  fetchingBills,
  fetchedBills,
  errorBills,
  bills,
  billsPageInfo,
  billsTotalCount,
  billsExport,
  errorBillsExport,
  actions,
  actionsContributionKey,
}) => {
  const prevSubmittingMutationRef = useRef();
  const [billToDelete, setBillToDelete] = useState(null);
  const [deletedBillUuids, setDeletedBillUuids] = useState([]);
  const [failedExport, setFailedExport] = useState(false);
  const [queryParams, setQueryParams] = useState([]);
  const { economicUnit } = useSelector((state) => state.policyHolder);
  const economicUnitConfig = modulesManager.getConf("fe-core", "App.economicUnitConfig", DEFAULT.ECONOMIC_UNIT_CONFIG);
  const isAdminOrInspector = rights.includes(INSPECTOR_RIGHT) || rights.includes(ADMIN_RIGHT);
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

  const additionalExportFields =
    economicUnitConfig && economicUnit?.id && !isAdminOrInspector ? { subjectId: decodeId(economicUnit?.id) } : {};

  useEffect(() => billToDelete && openConfirmDialog(), [billToDelete]);

  useEffect(() => {
    if (billToDelete && confirmed) {
      confirmedAction();
      setDeletedBillUuids([...deletedBillUuids, billToDelete.id]);
    }
    billToDelete && confirmed !== null && setBillToDelete(null);
  }, [confirmed]);

  useEffect(() => {
    if (errorBillsExport) {
      setFailedExport(true);
    }
  }, [errorBillsExport]);

  useEffect(() => {
    if (billsExport) {
      downloadExport(billsExport, "bill_export.csv")();
    }

    return setFailedExport(false);
  }, [billsExport]);

  useEffect(() => {
    prevSubmittingMutationRef.current && !submittingMutation && journalize(mutation);
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const confirmedAction = useCallback(
    () =>
      deleteBill(
        billToDelete,
        formatMessageWithValues(intl, "bill", "delete.mutationLabel", {
          code: billToDelete.code,
        }),
      ),
    [billToDelete],
  );

  const openConfirmDialog = useCallback(
    () =>
      coreConfirm(
        formatMessageWithValues(intl, "bill", "delete.confirm.title", {
          code: billToDelete.code,
        }),
        formatMessage(intl, "bill", "delete.confirm.message"),
      ),
    [billToDelete],
  );

  const fetch = useCallback(
    (params) => {
      try {
        const actionParams = [...params];

        const decodedId = decodeId(economicUnit?.id ?? EMPTY_STRING);

        if (economicUnitConfig && economicUnit?.id && !isAdminOrInspector) {
          actionParams.push(`subjectId:"${decodedId}"`);
        }

        fetchBills(actionParams);
      } catch (error) {
        throw new Error(`[BILL_SEARCHER]: Fetching bills failed. ${error}`);
      }
    },
    [economicUnit],
  );

  const headers = () => {
    const headers = ["bill.code", "bill.dateBill", "bill.amountTotal", "bill.status.label"];

    if (!isWorker) {
      const additionalHeaders = ["bill.subject", "bill.thirdparty"];

      headers.unshift(...additionalHeaders);
    }

    if (rights.includes(RIGHT_BILL_SEARCH)) {
      headers.push("emptyLabel");
    }
    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (bill) => bill.code,
      (bill) => (!!bill.dateBill ? formatDateFromISO(modulesManager, intl, bill.dateBill) : EMPTY_STRING),
      (bill) => bill.amountTotal,
      (bill) => <InvoiceStatusPicker value={bill?.status} readOnly />,
      (bill) => (
        <div style={{ textAlign: "right" }}>
          {rights.includes(RIGHT_BILL_SEARCH) && (
            <Tooltip title={formatMessage(intl, "invoice", isWorker ? "viewDetailsButtonTooltip" : "editButtonTooltip")}>
              <IconButton
                href={billUpdatePageUrl(bill)}
                onClick={(e) => e.stopPropagation() && onDoubleClick(bill)}
                disabled={deletedBillUuids.includes(bill.id)}
              >
                {isWorker ? <VisibilityIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
          )}
          {rights.includes(RIGHT_BILL_DELETE) && (
            <Tooltip title={formatMessage(intl, "invoice", "deleteButtonTooltip")}>
              <IconButton
                onClick={() => onDelete(bill)}
                disabled={bill?.status === STATUS.PAID || deletedBillUuids.includes(bill.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    ];

    if (!isWorker) {
      const additionalFormatters = [
        (bill) => getSubjectAndThirdpartyTypePicker(modulesManager, bill.subjectTypeName, bill.subject),
        (bill) => getSubjectAndThirdpartyTypePicker(modulesManager, bill.thirdpartyTypeName, bill.thirdparty),
      ];

      formatters.unshift(...additionalFormatters);
    }

    return formatters;
  };

  const rowIdentifier = (bill) => bill.id;

  const sorts = () => {
    const sortsArray = [
      ["code", true],
      ["dateBill", true],
      ["amountTotal", true],
      ["status", true],
    ];

    if (!isWorker) {
      sortsArray.unshift(
        ...[
          ["subjectType", true],
          ["thirdpartyType", true],
        ],
      );
    }

    return sortsArray;
  };

  const billUpdatePageUrl = (bill) => modulesManager.getRef("bill.route.bill") + "/" + bill?.id;

  const onDoubleClick = (bill, newTab = false) =>
    rights.includes(RIGHT_BILL_SEARCH) &&
    !deletedBillUuids.includes(bill.id) &&
    historyPush(modulesManager, history, "bill.route.bill", [bill?.id], newTab);

  const onDelete = (bill) => setBillToDelete(bill);

  const isRowDisabled = (_, bill) => deletedBillUuids.includes(bill.id);

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: "isDeleted: false",
    },
  });

  const filtersToQueryParams = ({ filters, pageSize, beforeCursor, afterCursor, orderBy }) => {
    const queryParams = Object.keys(filters)
      .filter((f) => !!filters[f].filter)
      .map((f) => filters[f].filter);
    if (!beforeCursor && !afterCursor) {
      queryParams.push(`first: ${pageSize}`);
    }
    if (afterCursor) {
      queryParams.push(`after: "${afterCursor}"`);
      queryParams.push(`first: ${pageSize}`);
    }
    if (beforeCursor) {
      queryParams.push(`before: "${beforeCursor}"`);
      queryParams.push(`last: ${pageSize}`);
    }
    if (orderBy) {
      queryParams.push(`orderBy: ["${orderBy}"]`);
    }
    setQueryParams(queryParams);
    return queryParams;
  };

  useEffect(() => {
    if (queryParams.length) {
      fetch(queryParams);
    }
  }, [economicUnit, queryParams]);

  return (
    <div>
      <Searcher
        module="bill"
        FilterPane={BillFilter}
        fetch={fetch}
        items={bills}
        itemsPageInfo={billsPageInfo}
        fetchingItems={fetchingBills}
        fetchedItems={fetchedBills}
        errorItems={errorBills}
        filtersToQueryParams={filtersToQueryParams}
        tableTitle={formatMessageWithValues(intl, "bill", "bills.searcherResultsTitle", {
          billsTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="code"
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
        actions={actions}
        actionsContributionKey={actionsContributionKey}
        withSelection={economicUnitConfig && economicUnit?.id && !isAdminOrInspector ? null : "multiple"}
        selectionMessage={"bill.selection.count"}
        exportable={true}
        exportFetch={fetchBillsExport}
        exportFields={[
          "id",
          "userCreated.username",
          "amount_total",
          "subjectType",
          "subjectId",
          "thirdpartyType",
          "thirdpartyId",
          "code",
          "status",
          "dateBill",
        ]}
        exportFieldsColumns={{
          "id": "ID",
          "userCreated.username": "User",
          "amount_total": "AmountTotal",
          "subjectType": "Subject Type",
          "subject": "subject",
          "thirdpartyType": "SenderType",
          "thirdparty": "Sender",
          "code": "code",
          "dateBill": "Date Bill",
          "status": "Status",
        }}
        additionalExportFields={additionalExportFields}
        downloadWithIconButton={isWorker}
      />
      {failedExport && (
        <Dialog open={failedExport} fullWidth maxWidth="sm">
          <DialogTitle>{errorBillsExport?.message}</DialogTitle>
          <DialogContent>
            <strong>{`${errorBillsExport?.code}: `}</strong>
            {errorBillsExport?.detail}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFailedExport(false)} color="primary" variant="contained">
              {formatMessage(intl, "invoice", "ok")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  fetchingBills: state.invoice.fetchingBills,
  fetchedBills: state.invoice.fetchedBills,
  errorBills: state.invoice.errorBills,
  bills: state.invoice.bills,
  billsPageInfo: state.invoice.billsPageInfo,
  billsTotalCount: state.invoice.billsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
  fetchingBillsExport: state.invoice.fetchingBillsExport,
  fetchedBillsExport: state.invoice.fetchedBillsExport,
  billsExport: state.invoice.billsExport,
  billsExportPageInfo: state.invoice.billsExportPageInfo,
  errorBillsExport: state.invoice.errorBillsExport,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchBills,
      deleteBill,
      fetchBillsExport,
      downloadExport,
      coreConfirm,
      journalize,
    },
    dispatch,
  );
};

export default withHistory(withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BillSearcher))));
