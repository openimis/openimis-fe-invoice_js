import React, { useState } from "react";
import { Paper, Grid } from "@material-ui/core";
import { Contributions } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  BILL_LINE_ITEMS_TAB_VALUE,
  BILL_TABS_LABEL_CONTRIBUTION_KEY,
  BILL_TABS_PANEL_CONTRIBUTION_KEY,
} from "../constants";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: {
    padding: 0,
  },
  selectedTab: {
    borderBottom: "4px solid white",
  },
  unselectedTab: {
    borderBottom: "4px solid transparent",
  },
});

const BillTabPanel = ({ intl, rights, classes, bill, setConfirmedAction, isWorker = false }) => {
  const [activeTab, setActiveTab] = useState(BILL_LINE_ITEMS_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <Contributions
          contributionKey={BILL_TABS_LABEL_CONTRIBUTION_KEY}
          intl={intl}
          rights={rights}
          value={activeTab}
          onChange={handleChange}
          isSelected={isSelected}
          tabStyle={tabStyle}
          isWorker={isWorker}
        />
      </Grid>
      <Contributions
        contributionKey={BILL_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        bill={bill}
        setConfirmedAction={setConfirmedAction}
        isWorker={isWorker}
      />
    </Paper>
  );
};

export default injectIntl(withTheme(withStyles(styles)(BillTabPanel)));
