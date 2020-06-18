import { useContent } from '../store/cms';
import Link from './Link';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  id?: string;
  text?: string;
  markdown?: boolean;
  className?: string;
  defaultText?: string;
}

const Content: React.FC<Props> = ({ id, markdown = false, className, text, defaultText }) => {
  const cmsContent = useContent(id);
  const content = text || cmsContent || defaultText;

  return markdown ? (
    <ReactMarkdown
      unwrapDisallowed
      disallowedTypes={['paragraph']}
      renderers={{ link: Link, linkReference: Link }}
      source={content}
    />
  ) : (
    <span className={className}>{content}</span>
  );
};

export default Content;
