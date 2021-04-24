import { IAppState } from '../store/app';
import { useContent } from '../store/cms';
import { useSelector } from 'react-redux';
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

const Content: React.FC<Props> = ({ id, markdown = false, className, text, defaultText, allowParagraphs = null }) => {
  const cmsContent = useContent(id);
  let content
  console.log("id, cmsContent", id, cmsContent)
  if( cmsContent !== undefined ) {
    content = cmsContent
  } else {
    content = text || defaultText || '';
  }

  const configParagraphs = useSelector((state: IAppState) => state.cms.config.defaultAllowParagraphs);

  if (allowParagraphs === null) {
    allowParagraphs = configParagraphs;
  }

  return markdown ? (
    <ReactMarkdown
      unwrapDisallowed={!allowParagraphs}
      disallowedTypes={!allowParagraphs ? ['paragraph'] : undefined}
      renderers={{ link: Link, linkReference: Link }}
      source={content}
    />
  ) : (
    <span className={className}>{content}</span>
  );
};

export default Content;
