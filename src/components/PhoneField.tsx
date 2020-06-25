import 'cleave.js/dist/addons/cleave-phone.us.js';
import Cleave from 'cleave.js/react';
import React from 'react';

interface Props {}

const PhoneField: React.FC<Props> = (props: any) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <Cleave
      {...other}
      htmlRef={inputRef}
      type="tel"
      placeholder="000-000-0000"
      onChange={(e: any) => onChange({ target: { value: e.target.rawValue } })}
      options={{
        phone: true,
        phoneRegionCode: 'US',
        delimiter: '-',
      }}
    />
  );
};

export default PhoneField;
