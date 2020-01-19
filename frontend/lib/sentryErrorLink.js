import * as Sentry from '@sentry/browser';
import { onError } from 'apollo-link-error';

const sentryErrorLink = onError(
  ({ operation, response, graphQLErrors, networkError }) => {
    const meta = {
      type: operation.query.definitions.find(defn => defn.operation).operation,
      variables: JSON.stringify(operation.variables, null, 2)
    };

    const context = operation.getContext();

    Sentry.addBreadcrumb({
      category: 'graphql',
      // message: operation.operationName,
      data: {
        ...meta,
        response,
        graphQLErrors,
        networkError
      },
      level: Sentry.Severity.Error
    });
  }
);

export default sentryErrorLink;
