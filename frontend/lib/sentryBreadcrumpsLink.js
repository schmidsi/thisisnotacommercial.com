import { ApolloLink } from 'apollo-boost';
import * as Sentry from '@sentry/browser';

const sentryBreadcrumbsLink = new ApolloLink((operation, forward) => {
  const observer = forward(operation);

  const meta = {
    type: operation.query.definitions.find(defn => defn.operation).operation,
    variables: JSON.stringify(operation.variables, null, 2)
  };

  return observer.map(data => {
    Sentry.addBreadcrumb({
      category: 'graphql',
      message: operation.operationName,
      data: {
        ...meta
      },
      level: Sentry.Severity.Debug
    });

    return data;
  });
});

export default sentryBreadcrumbsLink;
