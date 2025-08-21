import { useEffect, useRef, useState } from 'react';
import { MdArrowDropDown, MdClose } from "react-icons/md";
import { InputButton } from './input';
import './styles/dropdown.css';

type DropdownOption = { id: number; name: string; };

type DropdownProps = {
  options: DropdownOption[],
  selectedId?: number,
  onChange?: (value: number) => void;
  onAdd?: (value: string) => void;
  onDelete?: (id: number) => void;
};

export function Dropdown({ options, onChange, onAdd, selectedId, onDelete }: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<DropdownOption>(
    options.find(o => o.id === selectedId) || options[0]
  );
  const [newEntry, setNewEntry] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setSelected(options.find(o => o.id === selectedId) || options[0]);
  }, [selectedId, options]);

  const handleSelect = (option: DropdownOption) => {
    setSelected(option);
    onChange?.(option.id);
    setIsOpen(false);
  };

  const handleAdd = () => {
    const trimmed = newEntry.trim();
    if (!trimmed) return;

    onAdd?.(trimmed);
    setNewEntry('');
  };

  const handleDelete = (option: DropdownOption) => onDelete?.(option.id);

  return (
    <div className="dropdown" ref={menuRef} style={{ position: "relative" }}>
      <div
        className={`dropdown-selected ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selected?.name || '?'} <MdArrowDropDown size={20} />
      </div>

      {isOpen && (
        <div
          className="dropdown-menu"
        >
          <div className='dropdown-input'>
            <InputButton
              placeholder='New project...'
              value={newEntry}
              onValueChange={setNewEntry}
              onButtonClick={handleAdd}
            />
          </div>

          {options.map((opt, i) => (
            <div
              key={i}
              className={`dropdown-option ${selected === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt.name}
              <button onClick={e => {
                e.stopPropagation();
                handleDelete(opt);
              }}><MdClose /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}