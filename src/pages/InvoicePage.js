import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Helmet,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  journalize,
  decodeId,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { RIGHT_INVOICE_UPDATE, STATUS } from "../constants";
import { fetchInvoice, deleteInvoice } from "../actions";
import InvoiceHeadPanel from "../components/InvoiceHeadPanel";
import DeleteIcon from "@material-ui/icons/Delete";
import { getInvoiceStatus } from "../util/invoice-status";
import InvoiceTabPanel from "../components/InvoiceTabPanel";

const styles = (theme) => ({
  page: theme.page,
});

const InvoicePage = ({
  intl,
  classes,
  rights,
  history,
  invoiceUuid,
  invoice,
  fetchInvoice,
  deleteInvoice,
  coreConfirm,
  confirmed,
  submittingMutation,
  mutation,
}) => {
  const [editedInvoice, setEditedInvoice] = useState({});
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (!!invoiceUuid) {
      fetchInvoice([`id: "${invoiceUuid}"`]);
    }
  }, [invoiceUuid]);

  useEffect(() => confirmed && confirmedAction(), [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      back();
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedInvoice(invoice), [invoice]);

  const back = () => history.goBack();

  const onChange = (invoice) => setEditedInvoice(invoice);

  const titleParams = (invoice) => ({ label: invoice?.code });

  const confirmedAction = () =>
    deleteInvoice(
      invoice,
      formatMessageWithValues(intl, "invoice", "delete.mutationLabel", {
        code: invoice?.code,
      }),
    );

  const openConfirmDialog = () =>
    coreConfirm(
      formatMessageWithValues(intl, "invoice", "delete.confirm.title", {
        code: invoice?.code,
      }),
      formatMessage(intl, "invoice", "delete.confirm.message"),
    );

  const actions = [
    !!invoice &&
      getInvoiceStatus(invoice) !== STATUS.PAYED && {
        doIt: openConfirmDialog,
        icon: <DeleteIcon />,
        tooltip: formatMessage(intl, "invoice", "delete.buttonTooltip"),
      },
  ];

  return (
    rights.includes(RIGHT_INVOICE_UPDATE) && (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(intl, "invoice", "pageTitle", titleParams(invoice))} />
        <Form
          module="invoice"
          title="pageTitle"
          titleParams={titleParams(invoice)}
          invoice={editedInvoice}
          back={back}
          onChange={onChange}
          HeadPanel={InvoiceHeadPanel}
          Panels={[InvoiceTabPanel]}
          rights={rights}
          actions={actions}
        />
      </div>
    )
  );
};

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  invoiceUuid: props.match.params.invoice_uuid,
  confirmed: state.core.confirmed,
  fetchingInvoice: state.invoice.fetchingInvoice,
  fetchedInvoice: state.invoice.fetchedInvoice,
  invoice: state.invoice.invoice && {
    ...state.invoice.invoice,
    id: decodeId(state.invoice.invoice.id),
  },
  errorInvoice: state.invoice.errorInvoice,
  policyHolders: state.policyHolder.policyHolders,
  confirmed: state.core.confirmed,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchInvoice, deleteInvoice, coreConfirm, journalize }, dispatch);
};

export default withHistory(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(InvoicePage)))),
);