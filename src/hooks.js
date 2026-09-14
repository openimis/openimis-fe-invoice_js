import { useMemo } from "react";
import { useGraphqlQuery } from "@openimis/fe-core";
import _ from "lodash";

/**
 * Invoices covering a given subject line (e.g. a policy).
 *
 * An invoice's own subject is the *family* (see PolicyToInvoiceConverter in
 * openimis-be-calcrule_contribution_legacy); the individual policy is only
 * referenced by its invoice line item, through the `line` generic FK whose
 * `lineId` holds the subject's integer pk. So the lookup goes through the line
 * items and reads their parent invoice.
 */
export const useInvoiceLineItemsByLine = (lineId, config = {}) => {
  const { isLoading, error, data, refetch } = useGraphqlQuery(
    `
    query ($lineId: String) {
      invoiceLineItem(lineId: $lineId) {
        totalCount
        edges {
          node {
            id
            code
            description
            quantity
            unitPrice
            amountNet
            amountTotal
            lineTypeName
            invoice {
              id
              code
              status
              dateInvoice
              dateDue
              amountTotal
              currencyCode
            }
          }
        }
      }
    }
    `,
    { lineId },
    { skip: !lineId, ...config },
  );

  const lineItems = useMemo(() => (data ? _.map(data.invoiceLineItem?.edges, "node") : []), [data]);
  const totalCount = useMemo(() => data?.invoiceLineItem?.totalCount ?? 0, [data]);

  return { isLoading, error, lineItems, totalCount, refetch };
};
