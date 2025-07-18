import React from "react";
import { Grid, Divider, Typography } from "@material-ui/core";
import { withModulesManager, TextInput, FormattedMessage, PublishedComponent, NumberInput } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import SubjectTypePickerBill from "../pickers/SubjectTypePickerBill";
import ThirdPartyTypePickerBill from "../pickers/ThirdPartyTypePickerBill";
import { getSubjectAndThirdpartyTypePicker } from "../util/subject-and-thirdparty-picker";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

const BillHeadPanel = ({ modulesManager, classes, bill, mandatoryFieldsEmpty }) => {
  const taxAnalysisTotal = !!bill?.taxAnalysis ? JSON.parse(bill.taxAnalysis)?.["total"] : null;
  return (
    <>
      <Grid container className={classes.tableTitle}>
        <Grid item>
          <Grid container align="center" justify="center" direction="column" className={classes.fullHeight}>
            <Grid item>
              <Typography>
                <FormattedMessage module="invoice" id="bill.headPanelTitle" />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      {mandatoryFieldsEmpty && (
        <>
          <div className={classes.item}>
            <FormattedMessage module="invoice" id="mandatoryFieldsEmptyError" />
          </div>
          <Divider />
        </>
      )}
      <Grid container className={classes.item}>
        <Grid item xs={3} className={classes.item}>
          <SubjectTypePickerBill label="bill.subject" withNull value={bill?.subjectTypeNameLabel} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          {getSubjectAndThirdpartyTypePicker(modulesManager, bill?.subjectTypeName, bill?.subject)}
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <ThirdPartyTypePickerBill label="bill.thirdparty" withNull value={bill?.thirdpartyTypeNameLabel} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          {getSubjectAndThirdpartyTypePicker(modulesManager, bill?.thirdpartyTypeName, bill?.thirdparty)}
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.code" value={bill?.code} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.codeTp" value={bill?.codeTp} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.codeExt" value={bill?.codeExt} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="bill.dateDue"
            value={bill?.dateDue}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="bill.dateBill"
            value={bill?.dateBill}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="bill.dateValidFrom"
            value={bill?.dateValidFrom}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="bill.dateValidTo"
            value={bill?.dateValidTo}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="invoice"
            label="bill.datePayed"
            value={bill?.datePayed}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="invoice"
            label="bill.amountDiscount"
            displayZero
            value={bill?.amountDiscount}
            readOnly
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput module="invoice" label="bill.amountNet" displayZero value={bill?.amountNet} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.taxAnalysis" value={taxAnalysisTotal} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput module="invoice" label="bill.amountTotal" displayZero value={bill?.amountTotal} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <InvoiceStatusPicker label="invoice.status.label" withNull value={bill?.status} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.currencyTpCode" value={bill?.currencyTpCode} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.currencyCode" value={bill?.currencyCode} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.note" value={bill?.note} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.terms" value={bill?.terms} readOnly />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput module="invoice" label="bill.paymentReference" value={bill?.paymentReference} readOnly />
        </Grid>
      </Grid>
    </>
  );
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(BillHeadPanel))));
