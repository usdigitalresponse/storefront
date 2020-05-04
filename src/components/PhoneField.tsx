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
      placeholder="(000) 000-0000"
      onChange={(e: any) => onChange({ target: { value: e.target.rawValue } })}
      options={{
        blocks: [0, 3, 3, 4],
        delimiters: ['(', ') ', '-'],
        numericOnly: true,
        noImmediatePrefix: true,
        rawValueTrimPrefix: true,
      }}
    />
  );
};

export default PhoneField;
