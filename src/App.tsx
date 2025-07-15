import "./App.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
// project structure:

// input to search for gifs
// gif grid to display results, paginated from 20 to 20.
// button to load more gifs

// each gif should be clickable, on click it should copy the gif url to the clipboard
// the search will be automatic, after a small delay when the user stops typing, to avoid too many requests
// the search should be case insensitive
// a notification should appear when the gif URL is copied to the clipboard
// the web should handle a loading state while fetching the gifs and an error state if the request fails

function App() {
  // const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = ""; // searchParams.get("query") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const [gifs, setGifs] = useState<
    Array<{ id: string; url: string; title: string }>
  >([]);
  const [paginationOffset, setPaginationOffset] = useState<number>(0);
  const [notificationClass, setNotificationClass] = useState<string>(
    "notification hidden"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const showNotification = () => {
    setNotificationClass("notification visible");
  };
  const hideNotification = () => {
    setNotificationClass("notification hidden");
  };

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
    setPaginationOffset(0);
    setSearchParams({ query: term });
    fetchGifs(true);
  };

  const handleGifClick = (gifUrl: string) => {
    navigator.clipboard.writeText(gifUrl).then(() => {
      showNotification();
      setTimeout(() => {
        hideNotification();
      }, 2000);
    });
  };

  const handleLoadMoreGifs = () => {
    setPaginationOffset((prevOffset) => prevOffset + 20);
    setSearchTerm(searchTerm);
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const fetchGifs = useCallback(
    async (resetGifs: boolean) => {
      const baseUrl = "https://api.giphy.com/v1/gifs/";
      let url = `${baseUrl}trending`;
      setLoading(true);
      setError(null);
      if (searchTerm.trim() !== "") {
        url = `${baseUrl}search`;
      }
      axios
        .get(url, {
          params: {
            api_key: import.meta.env.VITE_GIPHY_API_KEY,
            q: searchTerm,
            limit: 20,
            offset: paginationOffset,
          },
        })
        .then((response) => {
          const gifs = response.data.data.map((gif: any) => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            title: gif.title,
          }));

          if (paginationOffset === 0 || resetGifs) {
            setGifs(gifs);
          } else {
            setGifs((prevGifs) => [...prevGifs, ...gifs]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to fetch GIFs");
          setLoading(false);
        });
    },
    [searchTerm, paginationOffset]
  );

  useEffect(() => {
    fetchGifs(false);
  }, [fetchGifs]);

  return (
    <div className="container">
      <h1>Gyphy!</h1>
      <input
        type="text"
        name="searchInput"
        onChange={(e) => updateSearchTerm(e.target.value)}
        placeholder="Search for gifs..."
      />
      <div className={"gifGrid"}>
        {error ? (
          <p>{error}</p>
        ) : loading && gifs.length === 0 ? (
          <p className="loading">Loading...</p>
        ) : gifs.length === 0 ? (
          <p>No GIFs found</p>
        ) : (
          gifs.map((gif: { id: string; url: string; title: string }) => (
            <div key={gif.id} className={"gifItem"}>
              <img
                src={gif.url}
                alt={gif.title}
                onClick={() => handleGifClick(gif.url)}
              />
            </div>
          ))
        )}
      </div>
      {loading && <p className="loading">Loading more GIFs...</p>}

      <button className="loadMore" onClick={handleLoadMoreGifs}>
        Load More GIFs (Total: {gifs.length})
      </button>

      <div className={notificationClass}>
        ✅ GIF URL copied to clipboard!
        <button className="close" onClick={hideNotification}>
          X
        </button>
      </div>
    </div>
  );
}

export default App;
