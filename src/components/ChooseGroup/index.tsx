import {Autocomplete, TextField} from "@mui/material";
import React from "react";
import {Option} from "../../types/components/options";

interface ChooseGroupProps {
  options: Option[];
  selectedValue: null | Option;
  setSelectedValue: () => void;
  label?: string;
}

export const ChooseGroup: React.FC<ChooseGroupProps> = ({options, selectedValue, setSelectedValue, label='Выберите группу'}) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      value={selectedValue}
      onChange={(e, newValue) => setSelectedValue(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          style={{ width: '400px' }}
        />
      )}
    />
  );
};
