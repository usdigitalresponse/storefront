import { useContent } from '../store/cms';
import Interweave from 'interweave';
import React from 'react';

interface Props {
  id: string;
  className?: string;
}

const Content: React.FC<Props> = ({ id, className }) => {
  const text = useContent(id);
  return <Interweave className={className} content={text} />;
};

export default Content;
