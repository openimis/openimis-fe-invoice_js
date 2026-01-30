import React, { useState } from "react";
import { Paper, Grid } from "@mui/material";
import { Contributions } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  INVOICE_LINE_ITEMS_TAB_VALUE,
  INVOICE_TABS_LABEL_CONTRIBUTION_KEY,
  INVOICE_TABS_PANEL_CONTRIBUTION_KEY,
} from "../constants";

const StyledInvoiceTabPanel = styled('div')(({ theme }) => ({
  '& .paper': theme.paper.paper,
  '& .tableTitle': theme.table.title,
  '& .tabs': {
    padding: 0,
  },
  '& .selectedTab': {
    borderBottom: "4px solid white",
  },
  '& .unselectedTab': {
    borderBottom: "4px solid transparent",
  },
}));

const InvoiceTabPanel = ({ intl, rights, invoice, setConfirmedAction }) => {
  const [activeTab, setActiveTab] = useState(INVOICE_LINE_ITEMS_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? "selectedTab" : "unselectedTab");

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <StyledInvoiceTabPanel>
      <Paper className="paper">
        <Grid container className="tableTitle tabs">
          <Contributions
            contributionKey={INVOICE_TABS_LABEL_CONTRIBUTION_KEY}
            intl={intl}
            rights={rights}
            value={activeTab}
            onChange={handleChange}
            isSelected={isSelected}
            tabStyle={tabStyle}
          />
        </Grid>
        <Contributions
          contributionKey={INVOICE_TABS_PANEL_CONTRIBUTION_KEY}
          rights={rights}
          value={activeTab}
          invoice={invoice}
          setConfirmedAction={setConfirmedAction}
        />
      </Paper>
    </StyledInvoiceTabPanel>
  );
};

export { StyledInvoiceTabPanel };
export default injectIntl(InvoiceTabPanel);
