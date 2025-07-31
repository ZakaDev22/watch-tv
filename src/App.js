import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

const key = "b2523bbb";

const baseURL = `http://www.omdbapi.com/?apikey=${key}`; // Corrected baseURL

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function handleFetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(`${baseURL}&s=${query}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.Response === "False") {
          throw new Error(data.Error);
        }

        setMovies(response.data.Search || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        if (error.name === "AbortError") return; // Ignore abort errors
        setError("Failed to fetch movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    handleCloseDetails();
    handleFetchMovies();

    return () => {
      controller.abort(); // Cleanup function to abort the request
    };
  }, [query]);

  function handleClickMovie(id) {
    setSelectedId(id === selectedId ? null : id);
  }

  function handleCloseDetails() {
    setSelectedId(null);
  }

  function handleAddToWatchedList({ movie }) {
    setWatched((watched) => [...watched, movie]);
    handleCloseDetails();
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <Error message={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectedMovie={handleClickMovie} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseDetails={handleCloseDetails}
              onAddToWatchedList={handleAddToWatchedList}
              watchedList={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Error({ message }) {
  return <p className="error">⛔{message}</p>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function WatchedMovieList({ watched, onDeleteWatchedMovie }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovieItem
          key={movie.imdbID}
          movie={movie}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}
function WatchedMovieItem({ movie, onDeleteWatchedMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseDetails,
  onAddToWatchedList,
  watchedList,
}) {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isMovieWatched = watchedList.some(
    (movie) => movie.imdbID === selectedId
  );

  const watchedUserRating =
    watchedList.find((m) => m.imdbID === selectedId)?.userRating || 0;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre,
    Language: language,
    Country: country,
  } = selectedMovie;

  useEffect(
    function () {
      async function fetchMovieDetails() {
        try {
          setIsLoading(true);
          const response = await axios.get(`${baseURL}&i=${selectedId}`);
          if (response.data.Response === "False") {
            throw new Error(response.data.Error);
          }
          // selectedMovie = response.data;
          setSelectedMovie((mov) => response.data);
        } catch (error) {
          console.error("Error fetching movie details:", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchMovieDetails();
    },
    [selectedId]
  );

  function handleAdd() {
    const movie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating,
    };

    onAddToWatchedList({ movie });
  }

  useEffect(
    function () {
      if (!title) return;
      document.title = `Watch TV | ${title}`;

      return () => {
        document.title = "Watch TV";
      };
    },
    [title]
  );

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseDetails();
        }
      }
      document.addEventListener("keydown", callBack);
      return () => {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseDetails]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => onCloseDetails()}>
              &larr;
            </button>
            <img src={poster} alt={`Poster Of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {year} &bull; {runtime}
              </p>
              <p>{genre};</p>
              <p>⭐ {imdbRating} IMDB Rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isMovieWatched ? (
                <>
                  <StarRating
                    MaxRating={10}
                    size={30}
                    color="#fcc419"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add To Watch List
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="user-rating">
                    <small>
                      {" "}
                      You Had Allredy Watched And Reviewed This Movie ✅
                    </small>
                  </p>
                  <p className="user-rating-value">
                    Your Rating: {watchedUserRating} ⭐
                  </p>
                </>
              )}
            </div>
            <p>
              {language} &bull; {country}
            </p>

            <p className="details-plot">
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem
          key={movie.imdbID}
          movie={movie}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

function MovieItem({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎥</span>
      <h1>Watch TV</h1>
      <span role="img">📽</span>
    </div>
  );
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
