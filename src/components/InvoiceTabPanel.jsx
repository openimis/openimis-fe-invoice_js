import React, { useState } from "react";
import { Paper, Grid } from "@material-ui/core";
import { Contributions } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  INVOICE_LINE_ITEMS_TAB_VALUE,
  INVOICE_TABS_LABEL_CONTRIBUTION_KEY,
  INVOICE_TABS_PANEL_CONTRIBUTION_KEY,
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

const InvoiceTabPanel = ({ intl, rights, classes, invoice, setConfirmedAction }) => {
  const [activeTab, setActiveTab] = useState(INVOICE_LINE_ITEMS_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
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
  );
};

export default injectIntl(withTheme(withStyles(styles)(InvoiceTabPanel)));
