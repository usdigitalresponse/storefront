import { IAppState } from '../store/app';
import { IProductRouteParams } from '../common/types';
import { makeProductDetailSelector } from '../store/cms';
import { useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BaseLayout from '../layouts/BaseLayout';
import React, { useMemo } from 'react';
import styles from './ProductDetailPage.module.scss';

const ProductDetailPage: React.FC = () => {
  const productId = useRouteMatch<IProductRouteParams>().params.id;
  const productDetailSelector = useMemo(makeProductDetailSelector, []);
  const productDetail = useSelector((state: IAppState) => productDetailSelector(state, productId));

  return (
    <BaseLayout title={productDetail?.name}>
      <div className={styles.cart}>Product {productId}</div>
    </BaseLayout>
  );
};

export default ProductDetailPage;
