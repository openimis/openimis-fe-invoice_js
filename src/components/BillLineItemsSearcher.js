import React, { useEffect, useMemo } from "react";
import { injectIntl } from "react-intl";
import { formatMessageWithValues, Searcher, withHistory } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchBillLineItems, fetchBillMedicalCatalogs } from "../actions";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from "../constants";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import BillLineItemsFilter from "./BillLineItemsFilter";

const claimDetails = (details) => {
  let parsed = details;
  try {
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch (error) {
    return [];
  }
  return Array.isArray(parsed?.claim_details) ? parsed.claim_details : [];
};

const displayNumber = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toLocaleString() : value;
};

const BillClaimDetails = ({ billLineItems, currency, medicalItems, medicalServices }) => {
  const itemByCode = new Map((medicalItems || []).map((item) => [item.code, item]));
  const serviceByCode = new Map((medicalServices || []).map((service) => [service.code, service]));
  const rows = (billLineItems || []).flatMap((billItem) =>
    claimDetails(billItem.details).map((detail, index) => {
      const catalogue = detail.type === "item" ? itemByCode.get(detail.code) : serviceByCode.get(detail.code);
      const rate = catalogue?.price == null ? null : Number(catalogue.price);
      const validatedRate = detail.validated_rate == null ? rate : Number(detail.validated_rate);
      const submittedQuantity = Number(detail.submitted_quantity || 0);
      const approvedQuantity = Number(detail.approved_quantity || 0);
      const actualAmount = rate == null ? null : rate * submittedQuantity;
      const validatedAmount = validatedRate == null ? null : validatedRate * approvedQuantity;
      return {
        ...detail,
        name: catalogue?.name || detail.name,
        rate,
        validated_rate: validatedRate,
        submitted_amount: actualAmount,
        rejected_quantity: Math.max(submittedQuantity - approvedQuantity, 0),
        validated_amount: validatedAmount,
        non_validated_amount:
          actualAmount == null || validatedAmount == null ? null : Math.abs(actualAmount - validatedAmount),
        claimCode: billItem.code,
        key: `${billItem.id}-${detail.type}-${detail.code}-${index}`,
      };
    }),
  );
  if (!rows.length) return null;
  const money = (value) => (value == null ? "Rate unavailable" : `${displayNumber(value)} ${currency || ""}`.trim());
  return (
    <TableContainer component={Paper} style={{ marginTop: 16 }}>
      <Typography variant="h6" style={{ padding: 16 }}>
        Claim item and service details
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Claim</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Code / Name</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Submitted qty.</TableCell>
            <TableCell align="right">Actual amount</TableCell>
            <TableCell align="right">Approved qty.</TableCell>
            <TableCell align="right">Validated rate</TableCell>
            <TableCell align="right">Rejected qty.</TableCell>
            <TableCell align="right">Validated amount</TableCell>
            <TableCell align="right">Non-validated amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.claimCode}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{`${row.code || ""} - ${row.name || ""}`}</TableCell>
              <TableCell align="right">{money(row.rate)}</TableCell>
              <TableCell align="right">{displayNumber(row.submitted_quantity)}</TableCell>
              <TableCell align="right">{money(row.submitted_amount)}</TableCell>
              <TableCell align="right">{displayNumber(row.approved_quantity)}</TableCell>
              <TableCell align="right">{money(row.validated_rate)}</TableCell>
              <TableCell align="right">{displayNumber(row.rejected_quantity)}</TableCell>
              <TableCell align="right">{money(row.validated_amount)}</TableCell>
              <TableCell align="right">{money(row.non_validated_amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

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
  fetchBillMedicalCatalogs,
  fetchingBillMedicalCatalogs,
  errorBillMedicalCatalogs,
  billMedicalItems,
  billMedicalServices,
}) => {
  const fetch = (params) => fetchBillLineItems(params);
  const catalogueCodes = useMemo(() => {
    const details = (billLineItems || []).flatMap((billItem) => claimDetails(billItem.details));
    return {
      itemCodes: [...new Set(details.filter((detail) => detail.type === "item").map((detail) => detail.code).filter(Boolean))],
      serviceCodes: [
        ...new Set(details.filter((detail) => detail.type === "service").map((detail) => detail.code).filter(Boolean)),
      ],
    };
  }, [billLineItems]);

  useEffect(() => {
    if (catalogueCodes.itemCodes.length || catalogueCodes.serviceCodes.length) {
      fetchBillMedicalCatalogs(catalogueCodes.itemCodes, catalogueCodes.serviceCodes);
    }
  }, [catalogueCodes, fetchBillMedicalCatalogs]);

  const headers = () => [
    "billItem.code",
    "billItem.description",
    "billItem.ledgerAccount",
    "billItem.quantity",
    "billItem.unitPrice",
    "billItem.discount",
    "billItem.deduction",
    "billItem.amountTotal",
    "billItem.amountNet",
  ];

  const itemFormatters = () => [
    (billItem) => billItem.code,
    (billItem) => billItem.description,
    (billItem) => billItem.ledgerAccount,
    (billItem) => billItem.quantity,
    (billItem) => billItem.unitPrice,
    (billItem) => billItem.discount,
    (billItem) => billItem.deduction,
    (billItem) => billItem.amountTotal,
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

  const sorts = () => [
    ["code", true],
    ["description", true],
    ["ledgerAccount", true],
    ["quantity", true],
    ["unitPrice", true],
    ["discount", true],
    ["deduction", true],
    ["amountTotal", true],
    ["amountNet", true],
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
      <>
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
          headers={headers}
          itemFormatters={itemFormatters}
          sorts={sorts}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          defaultOrderBy="code"
          defaultFilters={defaultFilters()}
        />
        {errorBillMedicalCatalogs && (
          <Typography color="error">Unable to fetch medical item and service rates.</Typography>
        )}
        {!fetchingBillMedicalCatalogs && !errorBillMedicalCatalogs && (
          <BillClaimDetails
            billLineItems={billLineItems}
            currency={bill?.currencyCode}
            medicalItems={billMedicalItems}
            medicalServices={billMedicalServices}
          />
        )}
      </>
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
  fetchingBillMedicalCatalogs: state.invoice.fetchingBillMedicalCatalogs,
  errorBillMedicalCatalogs: state.invoice.errorBillMedicalCatalogs,
  billMedicalItems: state.invoice.billMedicalItems,
  billMedicalServices: state.invoice.billMedicalServices,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchBillLineItems,
      fetchBillMedicalCatalogs,
    },
    dispatch,
  );
};

export default withHistory(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BillLineItemsSearcher)));
