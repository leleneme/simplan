import { type ChangeEvent, type ReactNode } from 'react';
import { MdAdd } from 'react-icons/md';
import './styles/input.css';

interface InputProps {
  value?: string,
  onValueChange: (value: string) => void,
  placeholder?: string;
  leftSide?: ReactNode;
  maxLenght?: number;
}

export function Input(props: InputProps) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (props.onValueChange) {
      props.onValueChange(e.target.value);
    }
  };

  return (
    <div className='input-wrapper'>
      <input
        type='text'
        maxLength={props.maxLenght}
        placeholder={props.placeholder}
        value={props.value}
        onChange={onChange}
      />
      {props.leftSide}
    </div>
  );
}

interface InputButton extends InputProps {
  onButtonClick?: () => void;
  type?: 'submit',
  size?: number;
}

export function InputButton(props: InputButton) {
  const Button = () => (
    <button aria-label='Add' type={props.type} onClick={props.onButtonClick}>
      <MdAdd size={props.size || 24} />
    </button>
  );

  return (
    <Input
      {...props}
      leftSide={<Button />}
    />
  );
}