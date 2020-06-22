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
  allowParagraphs?: boolean;
}

const Content: React.FC<Props> = ({ id, markdown = false, className, text, defaultText, allowParagraphs }) => {
  const cmsContent = useContent(id);
  const content = text || cmsContent || defaultText;

  return markdown ? (
    <ReactMarkdown
      unwrapDisallowed={!allowParagraphs}
      disallowedTypes={allowParagraphs ? undefined : ['paragraph']}
      renderers={{ link: Link, linkReference: Link }}
      source={content}
    />
  ) : (
    <span className={className}>{content}</span>
  );
};

export default Content;
