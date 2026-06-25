import { searchFetch } from './apis/search.api';
import { AutoComplete } from './components/AutoComplete';

export const App = () => {
  return (
    <div className="App">
      <h1>AutoComplete Example</h1>
      <AutoComplete searchFetch={searchFetch} />
    </div>
  );
};
