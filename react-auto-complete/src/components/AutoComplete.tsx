import { useState, useEffect, useCallback } from 'react';

type AutoCompleteProps = {
  searchFetch: () => Promise<string[]>;
};

type AutoCompleteState = {
  inputValue: string;
  filteredOptions: string[];
  loading: boolean;
};

export const AutoComplete = ({ searchFetch }: AutoCompleteProps) => {
  const [autoCompleteState, setAutoCompleteState] = useState<AutoCompleteState>({
    inputValue: '',
    filteredOptions: [],
    loading: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setAutoCompleteState((s) => ({ ...s, inputValue }));
  };

  const filterData = useCallback(async () => {
    setAutoCompleteState((s) => ({ ...s, loading: true }));
    try {
      const options = await searchFetch();
      const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(autoCompleteState.inputValue.toLowerCase())
      );
      setAutoCompleteState((s) => ({ ...s, filteredOptions, loading: false }));
    } catch (err) {
      console.error('Error fetching data:', err);
      setAutoCompleteState((s) => ({ ...s, loading: false }));
    }
  }, [searchFetch, autoCompleteState.inputValue]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const highlightText = (str: string) => {
    const idx = str.toLowerCase().indexOf(autoCompleteState.inputValue.toLowerCase());
    if (idx === -1) return str;
    const beforeHighlight = str.slice(0, idx);
    const highlight = str.slice(idx, idx + autoCompleteState.inputValue.length);
    const afterHighlight = str.slice(idx + autoCompleteState.inputValue.length);
    return (
      <>
        {beforeHighlight}
        <span className="highlight">{highlight}</span>
        {afterHighlight}
      </>
    );
  };

  return (
    <div className="autocomplete-container">
      <input
        onChange={handleInputChange}
        placeholder="Type to search..."
        type="text"
        value={autoCompleteState.inputValue}
      />

      {autoCompleteState.loading && <div>Loading...</div>}

      {!autoCompleteState.loading && autoCompleteState.filteredOptions.length > 0 && (
        <ul className="autocomplete-options">
          {autoCompleteState.filteredOptions.map((option, idx) => (
            <li key={idx}>{highlightText(option)}</li>
          ))}
        </ul>
      )}

      {!autoCompleteState.loading && autoCompleteState.filteredOptions.length === 0 && (
        <div>No matching results</div>
      )}
    </div>
  );
};
