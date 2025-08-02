import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import AddIcon from "@mui/icons-material/Add";
import { FormattedMessage, TextInput, formatMessageWithValues } from "@openimis/fe-core";
import { Fab, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createInvoiceEventMessage } from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { EMPTY_EVENT_MESSAGE } from "../constants";
import { defaultDialogStyles } from "../util/styles";

const StyledInvoiceEventMessageDialog = styled('div')(({ theme }) => ({
  ...defaultDialogStyles(theme),
}));

const InvoiceEventMessageDialog = ({ intl, invoice, createInvoiceEventMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventMessage, setEventMessage] = useState({ invoiceId: invoice.id, ...EMPTY_EVENT_MESSAGE });

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setEventMessage({ invoiceId: eventMessage.invoiceId, ...EMPTY_EVENT_MESSAGE });
  };

  const handleSave = () => {
    createInvoiceEventMessage(
      eventMessage,
      formatMessageWithValues(intl, "invoice", "invoiceEventMessage.create.mutationLabel", {
        invoiceCode: invoice?.code,
      }),
    );
    handleClose();
  };

  const onAttributeChange = (attribute) => (value) =>
    setEventMessage({
      ...eventMessage,
      [attribute]: value,
    });

  const canSave = !!eventMessage?.message;

  return (
    <StyledInvoiceEventMessageDialog>
      <>
        <Fab size="small" color="primary" onClick={handleOpen}>
          <AddIcon />
        </Fab>
        <Dialog open={isOpen} onClose={handleClose}>
          <DialogTitle>
            <FormattedMessage module="invoice" id="invoiceEventMessage.create.label" />
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" className="item">
              <Grid item className="item">
                <TextInput
                  module="invoice"
                  label="invoiceEvent.message"
                  value={eventMessage?.message}
                  onChange={onAttributeChange("message")}
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
              <FormattedMessage module="invoice" id="dialog.create" />
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </StyledInvoiceEventMessageDialog>
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ createInvoiceEventMessage }, dispatch);

export default injectIntl(
  connect(null, mapDispatchToProps)(InvoiceEventMessageDialog),
);
