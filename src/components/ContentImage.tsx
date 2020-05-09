import { useContentImage } from '../store/cms';
import React from 'react';

interface Props {
  id: string;
  className?: string;
}

const ContentImage: React.FC<Props> = ({ id, className }) => {
  const image = useContentImage(id);
  return <img src={image.url} alt={image.alt} className={className} />;
};

export default ContentImage;
