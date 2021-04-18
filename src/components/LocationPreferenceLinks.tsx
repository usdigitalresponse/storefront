import React from 'react';

interface Props {
}

const LocationPreferenceLinks: React.FC<Props> = () => {
  //console.log('locationPrefs', locationPrefs);

return <div style={{margin: "20px"}}>
    <a
      href="https://sites.google.com/dcgreens.org/produceplusvendors/home"
      target="_blank"
      rel="noreferrer"
    >
      Learn about Pickup Site Locations
                    </a><br />
    <a href="https://sites.google.com/dcgreens.org/produceplusvendors/map-of-farmers-markets"
      target="_blank"
      rel="noreferrer"
    >
      Map of Pickup Sites
                    </a><br />
    <a
      href="https://sites.google.com/dcgreens.org/produceplusvendors/produce-selection"
      target="_blank"
      rel="noreferrer"
    >
      Produce Availability
    </a>
  </div>
};

export default LocationPreferenceLinks;
