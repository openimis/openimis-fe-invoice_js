import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  FormattedMessage,
  TextInput,
  formatMessageWithValues,
  GetIconComponent,
} from "@openimis/fe-core";
import { Fab, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createBillEventType } from "../actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { EMPTY_EVENT_MESSAGE } from "../constants";
import { defaultDialogStyles } from "../util/styles";
const AddIcon = GetIconComponent("Add")

const StyledBillEventMessageDialog = styled('div')(({ theme }) => ({
  ...defaultDialogStyles(theme),
}));

const BillEventMessageDialog = ({
  intl,
  bill,
  createBillEventType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventMessage, setEventMessage] = useState({ billId: bill.id, ...EMPTY_EVENT_MESSAGE });

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsOpen(false);
    setEventMessage({ billId: eventMessage.billId, ...EMPTY_EVENT_MESSAGE });
  };

  const handleSave = () => {
    createBillEventType(
      eventMessage,
      formatMessageWithValues(intl, "invoice", "billEventMessage.create.mutationLabel", {
        billCode: bill?.code,
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
    <StyledBillEventMessageDialog>
      <>
        <Fab size="small" color="primary" onClick={handleOpen}>
          <AddIcon />
        </Fab>
        <Dialog open={isOpen} onClose={handleClose}>
          <DialogTitle>
            <FormattedMessage module="invoice" id={`billEventMessage.create.label`} />
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" className="item">
              <Grid className="item">
                <TextInput
                  module="invoice"
                  label="billEvent.message"
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
    </StyledBillEventMessageDialog>
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ createBillEventType }, dispatch);

export { StyledBillEventMessageDialog };
export default injectIntl(
    connect(null, mapDispatchToProps)(BillEventMessageDialog),
  );
  