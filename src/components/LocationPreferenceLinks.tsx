import { IAppState } from '../store/app';
import { IConfig } from '../common/types';
import { useSelector } from 'react-redux';
import React from 'react';

interface Props {}

const LocationPreferenceLinks: React.FC<Props> = () => {
  //console.log('locationPrefs', locationPrefs);
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);

  return (
    <>
      {config.lotteryEnabled ? (
        <div style={{ margin: '20px' }}>
          <a href="https://sites.google.com/dcgreens.org/produceplusvendors/home" target="_blank" rel="noreferrer">
            Learn about Pickup Site Locations
          </a>
          <br />
          <a
            href="https://sites.google.com/dcgreens.org/produceplusvendors/map-of-farmers-markets"
            target="_blank"
            rel="noreferrer"
          >
            Map of Pickup Sites
          </a>
          <br />
          <a
            href="https://sites.google.com/dcgreens.org/produceplusvendors/produce-selection"
            target="_blank"
            rel="noreferrer"
          >
            Produce Availability
          </a>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default LocationPreferenceLinks;
