import { useIsSmall } from '../common/hooks';
import BaseLayout from '../layouts/BaseLayout';
import Loading from '../components/Loading';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './DriversPage.module.scss';

const DriversPage: React.FC = () => {
  const isSmall = useIsSmall();
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <BaseLayout padding={0} maxWidth="unset">
      <div className={classNames(styles.container, { [styles.small]: isSmall, [styles.loading]: loading })}>
        <script src="https://static.airtable.com/js/embed/embed_snippet_v1.js"></script>
        <iframe
          onLoad={() => setLoading(false)}
          title="Driver Application"
          className="airtable-embed airtable-dynamic-height"
          src="https://airtable.com/embed/shr0xQUXEgS0pgmTz?backgroundColor=white"
          frameBorder="0"
          width="100%"
          height={isSmall ? 2400 : 2280}
          style={{ backgroundColor: 'hsl(0,0%,98%)' }}
        />
        <div className={styles.brandCover} />
      </div>
      {loading && <Loading />}
    </BaseLayout>
  );
};

export default DriversPage;
