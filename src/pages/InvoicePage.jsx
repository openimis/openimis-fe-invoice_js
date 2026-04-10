import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Helmet,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  journalize,
  GetIconComponent,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { styled } from "@mui/material/styles";
import { RIGHT_INVOICE_UPDATE, STATUS } from "../constants";
import { fetchInvoice, deleteInvoice } from "../actions";
import InvoiceHeadPanel from "../components/InvoiceHeadPanel";
const DeleteIcon = GetIconComponent("Delete")
import { getEnumValue } from "../util/enum";
import InvoiceTabPanel from "../components/InvoiceTabPanel";
import { ACTION_TYPE } from "../reducer";
import { defaultPageStyles } from "../util/styles";

const StyledInvoicePage = styled('div')(({ theme }) => ({
  ...defaultPageStyles(theme),
}));

const InvoicePage = ({
  intl,
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
  journalize,
}) => {
  const [editedInvoice, setEditedInvoice] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (!!invoiceUuid) {
      fetchInvoice([`id: "${invoiceUuid}"`]);
    }
  }, [invoiceUuid]);

  useEffect(() => {
    if (confirmed) {
      confirmedAction();
    }
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      mutation?.actionType === ACTION_TYPE.DELETE_INVOICE && back();
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedInvoice(invoice), [invoice]);

  const back = () => history.goBack();

  const onChange = (invoice) => setEditedInvoice(invoice);

  const titleParams = (invoice) => ({ label: invoice?.code });

  const deleteInvoiceCallback = () =>
    deleteInvoice(
      invoice,
      formatMessageWithValues(intl, "invoice", "invoice.delete.mutationLabel", {
        code: invoice?.code,
      }),
    );

  const openDeleteInvoiceConfirmDialog = () => {
    setConfirmedAction(() => deleteInvoiceCallback);
    coreConfirm(
      formatMessageWithValues(intl, "invoice", "invoice.delete.confirm.title", {
        code: invoice?.code,
      }),
      formatMessage(intl, "invoice", "invoice.delete.confirm.message"),
    );
  };

  const actions = [
    !!invoice &&
      getEnumValue(invoice?.status) !== STATUS.PAID && {
        doIt: openDeleteInvoiceConfirmDialog,
        icon: <DeleteIcon />,
        tooltip: formatMessage(intl, "invoice", "deleteButtonTooltip"),
      },
  ];

  return (
    <StyledInvoicePage>
      {rights.includes(RIGHT_INVOICE_UPDATE) && (
        <div className="page">
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
            setConfirmedAction={setConfirmedAction}
          />
        </div>
      )}
    </StyledInvoicePage>
  );
};

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  invoiceUuid: props.match.params.invoice_uuid,
  confirmed: state.core.confirmed,
  fetchingInvoice: state.invoice.fetchingInvoice,
  fetchedInvoice: state.invoice.fetchedInvoice,
  invoice: state.invoice.invoice,
  errorInvoice: state.invoice.errorInvoice,
  policyHolders: state.policyHolder.policyHolders,
  submittingMutation: state.invoice.submittingMutation,
  mutation: state.invoice.mutation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchInvoice, deleteInvoice, coreConfirm, journalize }, dispatch);

export { StyledInvoicePage };
export default withHistory(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(InvoicePage)),
);
