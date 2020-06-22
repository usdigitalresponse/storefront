import { productListSelector, useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import ProductDetail from '../components/ProductDetail';
import ProductSummary from '../components/ProductSummary';
import React from 'react';
import classNames from 'classnames';
import styles from './ProductsPage.module.scss';

const ProductsPage: React.FC = () => {
  const productList = useSelector(productListSelector);
  const isSmall = useIsSmall();
  const title = useContent('products_page_title');
  const description = useContent('products_page_subtitle');
  const renderSummaries = productList.length > 4;

  return (
    <BaseLayout title={title} description={description}>
      <div className={classNames(styles.container, { [styles.summary]: renderSummaries, [styles.small]: isSmall })}>
        {productList.map((item) =>
          renderSummaries ? (
            <ProductSummary key={item.id} product={item} className={styles.productSummary} />
          ) : (
            <ProductDetail key={item.id} product={item} className={styles.productDetail} card={true} />
          ),
        )}
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
