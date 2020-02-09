import React from 'react';
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import reducer from "./store/store";
import SearchPlayer from './components/SearchPlayer';
import './App.css';

const store = createStore(reducer, applyMiddleware(thunk));

function App() {
  return (
    <div className="container">
      <Provider store={store}>
        <SearchPlayer />
      </Provider>
    </div>
  );
}

export default App;
