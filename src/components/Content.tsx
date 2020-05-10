import { useContent } from '../store/cms';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  id?: string;
  text?: string;
  markdown?: boolean;
  className?: string;
}

const Content: React.FC<Props> = ({ id, markdown = false, className, text }) => {
  const cmsContent = useContent(id);
  const content = text || cmsContent;

  return markdown ? (
    <ReactMarkdown unwrapDisallowed disallowedTypes={['paragraph']} source={content} />
  ) : (
    <span className={className}>{content}</span>
  );
};

export default Content;
