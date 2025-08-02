import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { injectIntl } from "react-intl";

import { styled } from "@mui/material/styles";

import { Helmet, withModulesManager, formatMessage, clearCurrentPaginationPage } from "@openimis/fe-core";
import { RIGHT_BILL_SEARCH } from "../constants";
import BillSearcher from "../components/BillSearcher";

const StyledBillsPage = styled('div')(({ theme }) => ({
  '& .page': theme.page,
  '& .fab': theme.fab,
}));

const BILL_SEARCHER_ACTION_CONTRIBUTION_KEY = "invoice.bill.SelectionAction";

const BillsPage = (props) => {
  const { rights } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCurrentPaginationPage());
  }, []);

  let actions = [];

  return (
    <StyledBillsPage>
      {rights.includes(RIGHT_BILL_SEARCH) && (
        <div className="page">
          <Helmet title={formatMessage(props.intl, "bill", "bills.pageTitle")} />
          <BillSearcher
            rights={rights}
            actions={actions}
            actionsContributionKey={BILL_SEARCHER_ACTION_CONTRIBUTION_KEY}
          />
        </div>
      )}
    </StyledBillsPage>
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(connect(mapStateToProps)(BillsPage)));
