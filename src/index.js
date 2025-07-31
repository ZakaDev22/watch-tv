import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarRating from "./StarRating";

function Test() {
  const [movieRating, setMovieRating] = React.useState(0);
  return (
    <div>
      <h1>Test Component</h1>
      <p>This is a test component to check rendering.</p>
      <StarRating
        MaxRating={10}
        size={24}
        color="blue"
        defaultRating={2}
        onSetRating={setMovieRating}
      />
      <p>you Rate This Movie With {movieRating} Stars</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
