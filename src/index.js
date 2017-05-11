import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as firebase from 'firebase';

import 'bulma/css/bulma.css';
import './index.css';

const config = {
  apiKey: "AIzaSyCWDYZaDPDGukKDFJ6ypTIMn3feSoplh0c",
  authDomain: "footycritic-50b01.firebaseapp.com",
  databaseURL: "https://footycritic-50b01.firebaseio.com",
  projectId: "footycritic-50b01",
  storageBucket: "footycritic-50b01.appspot.com",
  messagingSenderId: "378932444128"
};

firebase.initializeApp(config);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

