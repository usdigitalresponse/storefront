import { ISchedule } from '../common/types';
import { Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import React from 'react';

interface Props {
  schedules?: ISchedule[];
  variant?: Variant;
  className?: string;
  textClassName?: string;
}

const ScheduleView: React.FC<Props> = ({ schedules, variant = 'body1', className, textClassName }) => {
  return schedules && schedules.length ? (
    <div className={className}>
      {schedules.map((schedule) => (
        <Typography key={schedule.id} variant={variant} className={textClassName}>
          {schedule.day}s from {schedule.start} to {schedule.end}
        </Typography>
      ))}
    </div>
  ) : null;
};

export default ScheduleView;
