import { IAppState } from '../store/app';
import { InventoryRecord } from '../common/types';
import { Redirect } from 'react-router-dom';
import { productByCategorySelector, productListSelector, useContent } from '../store/cms';
import { useIsSmall } from '../common/hooks';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import CategoryHeader from '../components/CategoryHeader';
import PrescreenQuestions from '../components/PrescreenQuestions';
import ProductDetail from '../components/ProductDetail';
import ProductSummary from '../components/ProductSummary';
import React from 'react';
import classNames from 'classnames';
import styles from './ProductsPage.module.scss';

const ProductsPage: React.FC = () => {
  const productList = useSelector(productListSelector);
  const productByCategoryList = useSelector(productByCategorySelector);
  const ordersEnabled = useSelector((state: IAppState) => state.cms.config.ordersEnabled);
  const prescreenOrders = useSelector((state: IAppState) => state.cms.config.prescreenOrders);
  const isSmall = useIsSmall();
  const title = useContent('products_page_title');
  const description = useContent('products_page_subtitle');
  const prescreenTitle = useContent('prescreen_questionaire_title');
  const prescreenDescription = useContent('prescreen_questionaire_subtitle');
  const renderSummaries = productList.length > 4;
  const renderByCategory = Object.keys(productByCategoryList).length > 1;

  if (prescreenOrders) {
    return <>
      <BaseLayout title={prescreenTitle} description={prescreenDescription}>
        <PrescreenQuestions/>
      </BaseLayout>
    </>
  }

  const productListItems = (productList: InventoryRecord[]) => {
    return (
      <div className={classNames(styles.container, { [styles.summary]: renderSummaries, [styles.small]: isSmall })}>
        {productList.map((item) =>
          renderSummaries ? (
            <ProductSummary key={item.id} product={item} className={styles.productSummary} />
          ) : (
            <ProductDetail key={item.id} product={item} className={styles.productDetail} card={true} />
          ),
        )}
      </div>
    );
  };

  if (!ordersEnabled) {
    return <Redirect to="/" />;
  }

  if (renderByCategory) {
    return (
      <BaseLayout title={title} description={description}>
        {productByCategoryList.map((categoryRecord) => (
          <div key={categoryRecord.id}>
            <CategoryHeader
              key={categoryRecord.id}
              categoryName={categoryRecord.name}
              description={categoryRecord.description}
              centered={renderSummaries}
            />
            {productListItems(categoryRecord.inventory)}
          </div>
        ))}
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={title} description={description}>
      <div className={classNames(styles.container, { [styles.summary]: renderSummaries, [styles.small]: isSmall })}>
        {productListItems(productList)}
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
