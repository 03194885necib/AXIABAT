// components/SelectInput.jsx
const SelectInput = ({ id, options = [], defaultValue, ...props }) => {
    return (
      <select
        id={id}
        defaultValue={defaultValue}
        className="border p-2 rounded w-full"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };
  
  export default SelectInput;
  