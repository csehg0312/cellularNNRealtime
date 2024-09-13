import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import './index.css';

// Lazy load the components for different routes
const Home = lazy(() => import('./pages/Home'));
const STX = lazy(() => import('./pages/STX'));
const PhotoCNN = lazy(() => import('./pages/PhotoCNN'));
const VideoCNN = lazy(() => import('./pages/VideoCNN'));

// Define the root App component that wraps the children
const App = (props) => (
  <>
    <h1>My Application</h1>
    {props.children}
  </>
);

// Render the application with the Router and Routes
render(() => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/videocnn" component={VideoCNN} />
    <Route path="/photocnn" component={PhotoCNN} />
    <Route path="/stx" component={STX} />
  </Router>
), document.getElementById("root"));
