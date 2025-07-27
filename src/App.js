import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

const key = "b2523bbb";

const baseURL = `http://www.omdbapi.com/?apikey=${key}`; // Corrected baseURL

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("spider-man");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function handleFetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`${baseURL}&s=${query}`);
        if (response.data.Response === "False") {
          throw new Error(response.data.Error);
        }
        setMovies(response.data.Search || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
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

    handleFetchMovies();
  }, [query]);

  function handleClickMovie(id) {
    setSelectedId(id === selectedId ? null : id);
  }

  function handleCloseDetails() {
    setSelectedId(null);
  }

  function handleAddToWatchedList({ movie }) {
    setWatched((watched) => [...watched, movie]);
    console.log(watched);
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
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
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

function WatchedMovieList({ watched }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovieItem key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}
function WatchedMovieItem({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseDetails, onAddToWatchedList }) {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    UserRating: userRating,
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
    };

    console.log("Adding movie to watched list:", movie);
    onAddToWatchedList({ movie });
  }

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
              <StarRating MaxRating={10} size={30} color="#fcc419" />
              <button className="btn-add" onClick={handleAdd}>
                Add To Watch List
              </button>
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
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
