import { Button, Menu, MenuItem, Typography } from '@material-ui/core';
import { IAppState } from '../store/app';
import { IConfig } from '../common/types';
import { SetLanguage } from '../store/cms';
import { getLanguageName } from '../common/utils';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';

interface Props {
  className?: string;
}

const LanguageSelector: React.FC<Props> = ({ className }) => {
  const selectedLanguage = useSelector<IAppState, string>((state) => state.cms.language);
  const config = useSelector<IAppState, IConfig>((state) => state.cms.config);
  const { languages } = config;
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (language: string) => {
    return () => {
      dispatch(SetLanguage.create(language));
      setAnchorEl(null);
    };
  };

  return languages && languages.length > 1 && languages.map ? (
    <>
      <Button className={className} variant="outlined" size="small" color="primary" onClick={handleClick}>
        {getLanguageName(selectedLanguage)}
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose}>
        {languages.map((language, index) => (
          <MenuItem
            key={`${language}${index}`}
            onClick={handleSelect(language)}
            selected={selectedLanguage === language}
          >
            <Typography color="primary">{getLanguageName(language)}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  ) : null;
};

export default LanguageSelector;
