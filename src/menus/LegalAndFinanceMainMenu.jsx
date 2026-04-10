import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { GetIconComponent, formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import { LEGAL_AND_FINANCE_MAIN_MENU_CONTRIBUTION_KEY } from "../constants";
const BalanceIcon = GetIconComponent("Balance");
const LegalAndFinanceMainMenu = (props) => {
  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, "invoice", "mainMenu")}
      contributionKey={LEGAL_AND_FINANCE_MAIN_MENU_CONTRIBUTION_KEY}
      menuId="LegalAndFinanceMainMenu"
      icon={< BalanceIcon />}
    />
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(LegalAndFinanceMainMenu)));
