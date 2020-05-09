import { useContent } from '../store/cms';
import Interweave from 'interweave';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  id: string;
  markdown?: boolean;
  className?: string;
}

const Content: React.FC<Props> = ({ id, markdown = false, className }) => {
  const text = useContent(id);
  return markdown ? <ReactMarkdown source={text} /> : <Interweave className={className} content={text} />;
};

export default Content;
