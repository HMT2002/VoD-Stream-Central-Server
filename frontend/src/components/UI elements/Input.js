import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { InputAdornment, TextField } from '@mui/material';

import Button from './Button';

import '../../styles/Input.css';

const Input = React.forwardRef((props, ref) => {
  const [isValid, setIsValid] = useState(true);

  const [isVisiblePassword, setIsVisiblePassword] = useState(false);

  const inputRef = useRef();

  const ThrowError = () => {
    setIsValid(false);
  };

  const GetValue = () => {
    return inputRef.current.value;
  };

  const PasswordVisibilityHandler = () => {
    setIsVisiblePassword((prev) => !prev);
  };

  useEffect(() => {
    setIsValid(props.isValid);
  }, [props.isValid, props.value]);

  useImperativeHandle(ref, () => {
    return {
      throwError: ThrowError,
      getValue: GetValue,
    };
  });

  let textFieldProps = {
    id: props.id,
    className: 'input__text-field',
    style: props.style,
    inputRef: inputRef,
    type: !props.passwordToggle ? props.type : !isVisiblePassword ? 'password' : 'text',
    variant: props.variant,
    label: props.label,
    value: props.value,
    helperText: !isValid ? props.helperText : '',
    defaultValue: props.defaultValue,
    placeholder: props.placeholder,
    onChange: props.onChange,
    onBlur: props.onBlur,
    onFocus: props.onFocus,
    autoFocus: props.autoFocus,
    rows: props.rows,
    minRows: props.minRows,
    maxRows: props.maxRows,
    disabled: props.disabled,
  };

  if (isValid === false) textFieldProps = { ...textFieldProps, error: true };
  if (props.multiline === true) textFieldProps = { ...textFieldProps, multiline: true };

  return (
    <div className={`${props.className} w-full`} style={props.style}>
      <TextField
        {...textFieldProps}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {props.passwordToggle && (
                <Button
                  type="button"
                  className="button-password-visible"
                  icon={
                    !isVisiblePassword ? (
                      <AiOutlineEye className="button-password-visible__icon" />
                    ) : (
                      <AiOutlineEyeInvisible className="button-password-visible__icon" />
                    )
                  }
                  onClick={PasswordVisibilityHandler}
                />
              )}
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
});

export default Input;
