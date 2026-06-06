import React, { useState } from "react";
import { Paper, Grid } from "@mui/material";
import { Contributions } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  BILL_LINE_ITEMS_TAB_VALUE,
  BILL_TABS_LABEL_CONTRIBUTION_KEY,
  BILL_TABS_PANEL_CONTRIBUTION_KEY,
} from "../constants";

const StyledBillTabPanel = styled('div')(({ theme }) => ({
  '& .paper': theme.paper?.paper ?? {},
  '& .tableTitle': theme.table?.title ?? {},
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

const BillTabPanel = ({ intl, rights, bill, setConfirmedAction }) => {
  const [activeTab, setActiveTab] = useState(BILL_LINE_ITEMS_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? "selectedTab" : "unselectedTab");

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <StyledBillTabPanel>
      <Paper className="paper">
        <Grid container className="tableTitle tabs">
          <Contributions
            contributionKey={BILL_TABS_LABEL_CONTRIBUTION_KEY}
            intl={intl}
            rights={rights}
            value={activeTab}
            onChange={handleChange}
            isSelected={isSelected}
            tabStyle={tabStyle}
          />
        </Grid>
        <Contributions
          contributionKey={BILL_TABS_PANEL_CONTRIBUTION_KEY}
          rights={rights}
          value={activeTab}
          bill={bill}
          setConfirmedAction={setConfirmedAction}
        />
      </Paper>
    </StyledBillTabPanel>
  );
};

export { StyledBillTabPanel };
export default injectIntl(BillTabPanel);
