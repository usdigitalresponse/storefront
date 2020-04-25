import { CMSRecord } from '../common/types';
import { IAppState } from './app';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICmsState {
  records: Record<string, CMSRecord>;
  languages: string[];
  language: string;
}

// actions
export const SetRecords = TypedAction.define('APP/CMS/SET_RECORDS')<any>();
export const SetLanguages = TypedAction.define('APP/CMS/SET_LANGUAGES')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetRecords.TYPE, (state, records) => setWith(state, { records }))
  .withHandler(SetLanguages.TYPE, (state, languages) => setWith(state, { languages }))
  .withDefaultHandler((state) => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  records: {},
  languages: ['en'],
  language: 'en',
};

// utils
export function cmsValueForKeySelector(key: string) {
  return (state: IAppState): string => {
    const { records, language } = state.cms;

    const value: CMSRecord = records[key];

    if (!value) {
      console.error(`Missing ${key} value in CMS`);
      return '';
    }
    if (value.image) {
      return value.image[0]?.url;
    }

    return getRecordValueForLanguage(value, language);
  };
}

export function getRecordValueForLanguage(record: CMSRecord, language: string) {
  return record[language] as string;
}
