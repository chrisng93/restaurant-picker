/**
 * Routes
 */
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import AppContainer from './containers/AppContainer';
import NotFoundContainer from './containers/NotFoundContainer';
import HomeContainer from './containers/HomeContainer';
import SignInContainer from './containers/SignInContainer';
import SignUpContainer from './containers/SignUpContainer';
import SearchProcessContainer from './containers/SearchProcessContainer';
import LocationContainer from './containers/LocationContainer';
import TransitContainer from './containers/TransitContainer';
import FoodTypeContainer from './containers/FoodTypeContainer';
import EnsureAuthenticationContainer from './containers/EnsureAuthenticationContainer';
import ProfileContainer from './containers/ProfileContainer';
import ChoicesContainer from './containers/ChoicesContainer';
import SelectionContainer from './containers/SelectionContainer';
import SearchesContainer from './containers/SearchesContainer';

const routes = (
  <Route path="/" component={AppContainer}>
    <IndexRoute component={HomeContainer} />
    <Route path="/signin" component={SignInContainer} />
    <Route path="/signup" component={SignUpContainer} />
    <Route path="/search" component={SearchProcessContainer}>
      <IndexRoute component={LocationContainer} />
      <Route path="/search/location" component={LocationContainer} />
      <Route path="/search/transit" component={TransitContainer} />
      <Route path="/search/food" component={FoodTypeContainer} />
      <Route path="/search/choices" component={ChoicesContainer} />
      <Route path="/search/selection" component={SelectionContainer} />
  </Route>
    <Route path="/profile" component={EnsureAuthenticationContainer}>
      <IndexRoute component={ProfileContainer} />
      <Route path="/profile" component={ProfileContainer} />
    </Route>
    <Route path="/searches" component={EnsureAuthenticationContainer}>
      <IndexRoute component={SearchesContainer} />
      <Route path="/searches" component={SearchesContainer} />
    </Route>
    <Route path="*" component={NotFoundContainer} />
  </Route>
);

export default routes;
