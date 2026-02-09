import React from "react";
import { Grid, Divider, Typography } from "@mui/material";
import { withModulesManager, TextInput, FormattedMessage, PublishedComponent, NumberInput, GRID_RESPONSIVE_STANDARD } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import SubjectTypePicker from "../pickers/SubjectTypePicker";
import ThirdpartyTypePicker from "../pickers/ThirdpartyTypePicker";
import { getSubjectAndThirdpartyTypePicker } from "../util/subject-and-thirdparty-picker";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";
import { defaultHeadPanelStyles } from "../util/styles";

const StyledInvoiceHeadPanel = styled('div')(({ theme }) => ({
  ...defaultHeadPanelStyles(theme),
}));

const InvoiceHeadPanel = ({ modulesManager, invoice, mandatoryFieldsEmpty }) => {
  const taxAnalysisTotal = !!invoice?.taxAnalysis ? JSON.parse(invoice.taxAnalysis)?.["total"] : null;
  return (
    <StyledInvoiceHeadPanel>
      <>
        <Grid container className="tableTitle">
          <Grid>
            <Grid container align="center" justify="center" direction="column" className="fullHeight">
              <Grid>
                <Typography>
                  <FormattedMessage module="invoice" id="headPanelTitle" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        {mandatoryFieldsEmpty && (
          <>
            <div className="item">
              <FormattedMessage module="invoice" id="mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </>
        )}
        <Grid container className="form">
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <SubjectTypePicker label="invoice.subject" withNull value={invoice?.subjectTypeName} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            {getSubjectAndThirdpartyTypePicker(modulesManager, invoice?.subjectTypeName, invoice?.subject)}
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <ThirdpartyTypePicker label="invoice.thirdparty" withNull value={invoice?.thirdpartyTypeName} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            {getSubjectAndThirdpartyTypePicker(modulesManager, invoice?.thirdpartyTypeName, invoice?.thirdparty)}
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.code" value={invoice?.code} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.codeTp" value={invoice?.codeTp} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.codeExt" value={invoice?.codeExt} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="invoice.dateDue"
              value={invoice?.dateDue}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="invoice.dateInvoice"
              value={invoice?.dateInvoice}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="invoice.dateValidFrom"
              value={invoice?.dateValidFrom}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="invoice.dateValidTo"
              value={invoice?.dateValidTo}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="invoice.datePayed"
              value={invoice?.datePayed}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <NumberInput
              module="invoice"
              label="invoice.amountDiscount"
              displayZero
              value={invoice?.amountDiscount}
              readOnly
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <NumberInput module="invoice" label="invoice.amountNet" displayZero value={invoice?.amountNet} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.taxAnalysis" value={taxAnalysisTotal} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <NumberInput module="invoice" label="invoice.amountTotal" displayZero value={invoice?.amountTotal} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <InvoiceStatusPicker label="invoice.status.label" withNull value={invoice?.status} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.currencyTpCode" value={invoice?.currencyTpCode} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.currencyCode" value={invoice?.currencyCode} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.note" value={invoice?.note} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.terms" value={invoice?.terms} readOnly />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <TextInput module="invoice" label="invoice.paymentReference" value={invoice?.paymentReference} readOnly />
          </Grid>
        </Grid>
      </>
    </StyledInvoiceHeadPanel>
  );
};

export { StyledInvoiceHeadPanel };
export default withModulesManager(injectIntl(InvoiceHeadPanel));
