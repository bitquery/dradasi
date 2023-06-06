import { FunctionComponent, useState } from 'react';

type DidListProps = {
  readonly dids: unknown[];
  callback: (did: unknown) => void;
};

export const DidList: FunctionComponent<DidListProps> = ({
  dids,
  callback,
}) => {
  const [selectedItem, setSelectedItem] = useState<unknown>(null);

  const handleCheckboxChange = (item: unknown) => {
    setSelectedItem(item);
    callback(item);
  };

  return (
    <div>
      {dids.map((item, idx) => (
        <div key={idx}>
          <input
            type="checkbox"
            checked={selectedItem === item}
            onChange={() => handleCheckboxChange(item)}
          />
          <label>{JSON.stringify(item)}</label>
        </div>
      ))}
    </div>
  );
};
