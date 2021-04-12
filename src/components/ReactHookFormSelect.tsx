import { Control, Controller, FieldError, FieldValues, NestDataObject } from "react-hook-form";
import { FormHelperText } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import React, { ReactElement, ReactNode } from 'react'
import Select from "@material-ui/core/Select";


interface Props {
  id: string
  name: string
  label: string
  control: Control
  defaultValue: string,
  children: ReactNode[],
  errors: NestDataObject<FieldValues, FieldError>,
}

const ReactHookFormSelect: React.FC<Props> = ({ id, name, label,
  control,
  defaultValue,
  children,
  errors,
  ...props
}) => {
  const labelId = `${name}-label`;
  const error: FieldError = errors[name];

  console.log("name, error", name, error)

  return (
    <FormControl {...props} style={{width: "80%", margin: "0px auto", marginLeft: "20px"}}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        as={
          <Select labelId={labelId} label={label}>
            {children}
          </Select>
        }
        name={name}
        control={control}
        defaultValue={defaultValue}
      />
      { error && <FormHelperText error>{error.message}</FormHelperText>}
    </FormControl>
  );
};
export default ReactHookFormSelect;
