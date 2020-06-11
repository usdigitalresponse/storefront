import './Loading.scss';
import { IAppState } from '../store/app';
import { useSelector } from 'react-redux';
import React from 'react';

const Loading: React.FC = () => {
  const themeColor = useSelector<IAppState, string>((state) => state.cms.config.themeColor);

  return (
    <div className="sk-loading">
      <div className="sk-circle">
        <div className={`sk-circle1 sk-child ${themeColor}`}></div>
        <div className={`sk-circle2 sk-child ${themeColor}`}></div>
        <div className={`sk-circle3 sk-child ${themeColor}`}></div>
        <div className={`sk-circle4 sk-child ${themeColor}`}></div>
        <div className={`sk-circle5 sk-child ${themeColor}`}></div>
        <div className={`sk-circle6 sk-child ${themeColor}`}></div>
        <div className={`sk-circle7 sk-child ${themeColor}`}></div>
        <div className={`sk-circle8 sk-child ${themeColor}`}></div>
        <div className={`sk-circle9 sk-child ${themeColor}`}></div>
        <div className={`sk-circle10 sk-child ${themeColor}`}></div>
        <div className={`sk-circle11 sk-child ${themeColor}`}></div>
        <div className={`sk-circle12 sk-child ${themeColor}`}></div>
      </div>
    </div>
  );
};

export default Loading;
