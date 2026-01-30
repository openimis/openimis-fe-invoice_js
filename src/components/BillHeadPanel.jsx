import React from "react";
import { Grid, Divider, Typography } from "@mui/material";
import { withModulesManager, TextInput, FormattedMessage, PublishedComponent, NumberInput } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import SubjectTypePickerBill from "../pickers/SubjectTypePickerBill";
import ThirdPartyTypePickerBill from "../pickers/ThirdPartyTypePickerBill";
import { getSubjectAndThirdpartyTypePicker } from "../util/subject-and-thirdparty-picker";
import InvoiceStatusPicker from "../pickers/InvoiceStatusPicker";

const StyledBillHeadPanel = styled('div')(({ theme }) => ({
  '& .tableTitle': theme.table.title,
  '& .item': theme.paper.item,
  '& .fullHeight': {
    height: "100%",
  },
}));

const BillHeadPanel = ({ modulesManager, bill, mandatoryFieldsEmpty }) => {
  const taxAnalysisTotal = !!bill?.taxAnalysis ? JSON.parse(bill.taxAnalysis)?.["total"] : null;
  return (
    <StyledBillHeadPanel>
      <>
        <Grid container className="tableTitle">
          <Grid>
            <Grid container align="center" justify="center" direction="column" className="fullHeight">
              <Grid>
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
            <div className="item">
              <FormattedMessage module="invoice" id="mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </>
        )}
        <Grid container className="item">
          <Grid size={3} className="item">
            <SubjectTypePickerBill label="bill.subject" withNull value={bill?.subjectTypeNameLabel} readOnly />
          </Grid>
          <Grid size={3} className="item">
            {getSubjectAndThirdpartyTypePicker(modulesManager, bill?.subjectTypeName, bill?.subject)}
          </Grid>
          <Grid size={3} className="item">
            <ThirdPartyTypePickerBill label="bill.thirdparty" withNull value={bill?.thirdpartyTypeNameLabel} readOnly />
          </Grid>
          <Grid size={3} className="item">
            {getSubjectAndThirdpartyTypePicker(modulesManager, bill?.thirdpartyTypeName, bill?.thirdparty)}
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.code" value={bill?.code} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.codeTp" value={bill?.codeTp} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.codeExt" value={bill?.codeExt} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="bill.dateDue"
              value={bill?.dateDue}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="bill.dateBill"
              value={bill?.dateBill}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="bill.dateValidFrom"
              value={bill?.dateValidFrom}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="bill.dateValidTo"
              value={bill?.dateValidTo}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="invoice"
              label="bill.datePayed"
              value={bill?.datePayed}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <NumberInput
              module="invoice"
              label="bill.amountDiscount"
              displayZero
              value={bill?.amountDiscount}
              readOnly
            />
          </Grid>
          <Grid size={3} className="item">
            <NumberInput module="invoice" label="bill.amountNet" displayZero value={bill?.amountNet} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.taxAnalysis" value={taxAnalysisTotal} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <NumberInput module="invoice" label="bill.amountTotal" displayZero value={bill?.amountTotal} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <InvoiceStatusPicker label="invoice.status.label" withNull value={bill?.status} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.currencyTpCode" value={bill?.currencyTpCode} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.currencyCode" value={bill?.currencyCode} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.note" value={bill?.note} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.terms" value={bill?.terms} readOnly />
          </Grid>
          <Grid size={3} className="item">
            <TextInput module="invoice" label="bill.paymentReference" value={bill?.paymentReference} readOnly />
          </Grid>
        </Grid>
      </>
    </StyledBillHeadPanel>
  );
};

export { StyledBillHeadPanel };
export default withModulesManager(injectIntl(BillHeadPanel));
