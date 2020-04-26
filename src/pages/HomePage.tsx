import BaseLayout from '../layouts/BaseLayout';
import React from 'react';
import styles from './HomePage.module.scss';

interface Props {}

const HomePage: React.FC<Props> = () => {
  return <BaseLayout>Home Page</BaseLayout>;
};

export default HomePage;
