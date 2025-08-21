import { type ChangeEvent, type ReactNode } from 'react';
import './styles/input.css';

import { MdAdd } from 'react-icons/md';

interface InputProps {
  value?: string,
  onValueChange: (value: string) => void,
  placeholder?: string;
  leftSide?: ReactNode;
}

export function Input(props: InputProps) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (props.onValueChange) {
      props.onValueChange(e.target.value);
    }
  };

  return (
    <div className='input-wrapper'>
      <input value={props.value} onChange={onChange} type='text' placeholder={props.placeholder} />
      {props.leftSide}
    </div>
  );
}

interface InputButton extends InputProps {
  onButtonClick?: () => void;
  type?: 'submit',
  size?: number
}

export function InputButton(props: InputButton) {
  return (
    <Input
      value={props.value}
      placeholder={props.placeholder}
      onValueChange={props.onValueChange}
      leftSide={
        <button aria-label='Add' type={props.type} onClick={props.onButtonClick}>
          <MdAdd size={props.size || 24} />
        </button>}
    />
  );
}