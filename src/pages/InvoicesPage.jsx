import React, { useEffect } from "react";
import { Helmet, withModulesManager, formatMessage, clearCurrentPaginationPage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { connect, useDispatch } from "react-redux";
import { RIGHT_INVOICE_SEARCH } from "../constants";
import InvoiceSearcher from "../components/InvoiceSearcher";
import { defaultPageStyles } from "../util/styles";

const StyledInvoicesPage = styled('div')(({ theme }) => ({
  ...defaultPageStyles(theme),
}));

const InvoicesPage = ({ intl, rights }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCurrentPaginationPage());
  }, []);

  return (
    <StyledInvoicesPage>
      {rights.includes(RIGHT_INVOICE_SEARCH) && (
        <div className="page">
          <Helmet title={formatMessage(intl, "invoice", "invoices.pageTitle")} />
          <InvoiceSearcher rights={rights} />
        </div>
      )}
    </StyledInvoicesPage>
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(
  injectIntl(connect(mapStateToProps)(InvoicesPage)),
);
