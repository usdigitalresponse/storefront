import { reverse } from '../common/router';
import BaseLayout from '../layouts/BaseLayout';
import Link from '../components/Link';
import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <BaseLayout title="Page not found">
      <div>
        We're sorry we can't seem to find what you're looking for. Return to the{' '}
        <Link href={reverse('home')}>home page</Link>.
      </div>
    </BaseLayout>
  );
};

export default NotFoundPage;
