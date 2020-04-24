import { CMSRecord } from '../common/types';
import { IAppState } from './app';
import { TypedAction, TypedReducer, setWith } from 'redoodle';

// model
export interface ICmsState {
  records: CMSRecord[];
  language: string;
}

// actions
export const SetRecords = TypedAction.define('APP/CMS/SET_VAL')<any>();

// reducer
export const cmsReducer: any = TypedReducer.builder<ICmsState>()
  .withHandler(SetRecords.TYPE, (state, records) => setWith(state, { records }))
  .withDefaultHandler(state => (state ? state : initialCmsState))
  .build();

// init
export const initialCmsState: ICmsState = {
  records: [],
  language: 'en',
};

// utils
export const getCmsRecordForKey = (key: string) => (state: IAppState) => {
  const { records, language } = state.cms;

  const record = records
    .filter(record => record.key === key)
    .map(record => {
      record.image = record.picture[0]?.url;
      record.body = getRecordBody(record, language);
      record.title = getRecordTitle(record, language);
      return record;
    })[0];

  if (!record) {
    console.error(`Missing ${key} value in CMS`);
    return {};
  }

  if (!record.key) {
    console.error(
      `The CMS was set up incorrectly and is missing a "key" column. Check that the column name is not "Name"!`
    );
  }

  return record;
};

/*
 * Outputs the body of a record depending on the language of the user
 * and then formats it with a markdown processor
 * Defaults to english
 */
export function getRecordBody(record: CMSRecord, language = 'en') {
  const body = record[`body_${language}`] || record[`body_en`];
  retur body;
}

/*
 * Outputs the title of a record depending on the language of the user
 * Defaults to english
 */
export function getRecordTitle(record, language = 'en') {
  const title = record[`title_${language}`] || record[`title`];
  return title;
}

/*
 * This takes the 'languages' column and transforms it into something useful
 * For the footer to display the languge options
 * They are formatted like this:
 * English:en,Spanish:es
 */
export function getRecordLanguages(state) {
  const options = getCmsRecordFromKey('languages', state).data.split(',');
  if (!options) return [];
  return options.map(option => {
    const data = option.split(':');
    return { name: data[0], key: data[1] };
  });
}
