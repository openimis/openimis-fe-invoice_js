import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  FormattedMessage,
  PublishedComponent,
  TextInput,
  NumberInput,
  formatMessageWithValues,
  formatMessage,
  GetIconComponent,
} from "@openimis/fe-core";
import { Fab, Grid, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createPaymentInvoiceWithDetail, updateInvoicePayment } from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { EMPTY_PAYMENT_INVOICE } from "../constants";
import InvoicePaymentStatusPicker from "../pickers/InvoicePaymentStatusPicker";
import PaymentInvoiceStatusPicker from "../pickers/PaymentInvoiceStatusPicker";
import { defaultDialogStyles } from "../util/styles";
const AddIcon = GetIconComponent("Add")
const EditIcon = GetIconComponent("Edit")

const StyledInvoicePaymentDialog = styled('div')(({ theme }) => ({
  ...defaultDialogStyles(theme),
}));

const InvoicePaymentDialog = ({
  intl,
  invoice,
  invoicePayment = null,
  disabled,
  createPaymentInvoiceWithDetail,
  updatePaymentInvoice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payment, setPayment] = useState({ invoiceId: invoice.id, ...(invoicePayment ?? EMPTY_PAYMENT_INVOICE) });
  const isNew = !invoicePayment;

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setPayment({ invoiceId: payment.invoiceId, ...(isNew ? EMPTY_PAYMENT_INVOICE : invoicePayment) });
  };

  const handleSave = () => {
    isNew
      ? createPaymentInvoiceWithDetail(
          payment,
          payment.invoiceId, 
          "invoice",
          formatMessageWithValues(intl, "invoice", "paymentInvoice.create.mutationLabel", {
            paymentInvoiceLabel: payment.label,
            code: invoice?.code,
          }),
        )
      : updateInvoicePayment(
          payment,
          formatMessageWithValues(intl, "invoice", "paymentInvoice.update.mutationLabel", {
            paymentInvoiceLabel: payment.label,
            code: invoice?.code,
          }),
        );
    handleClose();
  };

  const onAttributeChange = (attribute) => (value) =>
    setPayment({
      ...payment,
      [attribute]: value,
    });

  const canSave = Object.keys(payment)?.every((key) => !!payment[key]);

  return (
    <StyledInvoicePaymentDialog>
      <>
        {isNew ? (
          <Fab size="small" color="primary" onClick={handleOpen}>
            <AddIcon />
          </Fab>
        ) : (
          <Tooltip title={formatMessage(intl, "invoice", "editButtonTooltip")}>
            <IconButton onClick={handleOpen} disabled={disabled}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        <Dialog open={isOpen} onClose={handleClose}>
          <DialogTitle>
            <FormattedMessage module="invoice" id={`invoicePayment.${isNew ? "create" : "update"}.label`} />
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" className="item">
              <Grid className="item">
                <PaymentInvoiceStatusPicker
                  label="paymentInvoice.reconciliationStatus.label"
                  withNull
                  value={payment?.reconciliationStatus}
                  onChange={onAttributeChange("reconciliationStatus")}
                  required
                />
              </Grid>
              <Grid className="item">
                <InvoicePaymentStatusPicker
                  label="paymentInvoice.status.label"
                  withNull
                  value={payment?.status}
                  onChange={onAttributeChange("status")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.payerRef"
                  value={payment?.payerRef}
                  onChange={onAttributeChange("payerRef")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.payerName"
                  value={payment?.payerName}
                  onChange={onAttributeChange("payerName")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.codeExt"
                  value={payment?.codeExt}
                  onChange={onAttributeChange("codeExt")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.label"
                  value={payment?.label}
                  onChange={onAttributeChange("label")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.codeTp"
                  value={payment?.codeTp}
                  onChange={onAttributeChange("codeTp")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.codeReceipt"
                  value={payment?.codeReceipt}
                  onChange={onAttributeChange("codeReceipt")}
                  required
                />
              </Grid>
              <Grid className="item">
                <NumberInput
                  module="invoice"
                  label="paymentInvoice.fees"
                  min={0}
                  value={payment?.fees}
                  onChange={onAttributeChange("fees")}
                  required
                />
              </Grid>
              <Grid className="item">
                <NumberInput
                  module="invoice"
                  label="paymentInvoice.amountReceived"
                  min={0}
                  value={payment?.amountReceived}
                  onChange={onAttributeChange("amountReceived")}
                  required
                />
              </Grid>
              <Grid className="item">
                <PublishedComponent
                  pubRef="core.DatePicker"
                  module="invoice"
                  label="paymentInvoice.datePayment"
                  value={payment?.datePayment}
                  onChange={onAttributeChange("datePayment")}
                  required
                />
              </Grid>
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="paymentInvoice.paymentOrigin"
                  value={payment?.paymentOrigin}
                  onChange={onAttributeChange("paymentOrigin")}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined">
              <FormattedMessage module="invoice" id="dialog.cancel" />
            </Button>
            <Button onClick={handleSave} disabled={!canSave} variant="contained" color="primary" autoFocus>
              <FormattedMessage module="invoice" id={`dialog.${isNew ? "create" : "update"}`} />
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </StyledInvoicePaymentDialog>
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ createPaymentInvoiceWithDetail, updateInvoicePayment }, dispatch);

export { StyledInvoicePaymentDialog };
export default injectIntl(
  connect(null, mapDispatchToProps)(InvoicePaymentDialog),
);
