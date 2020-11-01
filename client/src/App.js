import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
 import { ApolloProvider } from '@apollo/react-hooks';
 import ApolloClient from 'apollo-boost';
import Auth from './utils/auth';

const client = new ApolloClient({
  request: operation => {
    const token = Auth.getToken();

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });
  },
  uri: 'http://localhost:3001/graphql'
});
   
function App() {
  return (
     <ApolloProvider client={client}>
    <Router>
      <>
        <Navbar />
        <Switch>
          <Route render={() => <h1 className='display-2'>First page!</h1>} />
        </Switch>
      </>
    </Router>
     </ApolloProvider>
  );
}

export default App;

