import { IAppState } from '../store/app';
import { IProductRouteParams } from '../common/types';
import { Link } from '@material-ui/core';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';
import { makeProductDetailSelector } from '../store/cms';
import { useSelector } from 'react-redux';
import BackIcon from '@material-ui/icons/ArrowBack';
import BaseLayout from '../layouts/BaseLayout';
import ProductDetail from '../components/ProductDetail';
import React, { useMemo } from 'react';
import styles from './ProductPage.module.scss';

interface Props {}

const ProductPage: React.FC<Props> = () => {
  const routeMatch = useRouteMatch<IProductRouteParams>();
  const productDetailSelector = useMemo(makeProductDetailSelector, []);
  const product = useSelector((state: IAppState) => productDetailSelector(state, routeMatch.params.id));
  const history = useHistory();

  return (
    <BaseLayout>
      {product && (
        <div className={styles.container}>
          <Link className={styles.backLink} onClick={() => history.goBack()}>
            <BackIcon fontSize="inherit" className={styles.backIcon} /> Back to list
          </Link>
          <ProductDetail product={product} />
        </div>
      )}
      {!product && <Redirect to="/notfound" />}
    </BaseLayout>
  );
};

export default ProductPage;
