import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {t} from '../i18n/index.js';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <div className="pagination-link">
              <PreviousLink className="pagination-btn">
                {isLoading ? t('pagination.loading') : t('pagination.previous')}
              </PreviousLink>
            </div>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <div className="pagination-link">
              <NextLink className="pagination-btn">
                {isLoading ? t('pagination.loading') : t('pagination.next')}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
