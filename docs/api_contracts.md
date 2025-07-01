# Flicklog: External API Contracts

This document outlines our interaction with external APIs, primarily The Movie Database (TMDB). It specifies the endpoints we use, the data we expect, and our general interaction strategy.

## TMDB API (v3)

- **Base URL:** `https://api.themoviedb.org/3`
- **Authentication:** All requests must include the `TMDB_API_KEY` as an API key.
- **Caching Strategy:** TMDB API responses will be aggressively cached (for at least 24 hours) to respect rate limits and improve application performance.

### A. Critical First Step: Building Image URLs

TMDB does not provide full URLs for images. We must construct them by combining three pieces of data from the `/configuration` endpoint. This endpoint should be called on application startup and the results cached.

**Endpoint: `GET /configuration`**
- **Purpose:** To fetch the base URL and available sizes for all TMDB images.
- **Sample Response Shape (Fields we need):**
  ```json
  {
    "images": {
      "base_url": "http://image.tmdb.org/t/p/",
      "secure_base_url": "https://image.tmdb.org/t/p/",
      "poster_sizes": ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
      "backdrop_sizes": ["w300", "w780", "w1280", "original"]
    }
  }
  ```
- **Usage Example:** `secure_base_url` + `poster_sizes[4]` + `poster_path` -> `https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9Gz0gSbn0QhTm.jpg`

---

### B. Core Endpoints for Logging

These endpoints power the search and selection flow when a user logs a new entry.

**1. Endpoint: `GET /search/movie`**
- **Purpose:** To find movies by title for the logging form.
- **Key Parameters:**
    - `query`: The user's search string.
    - `page`: For pagination.
- **Sample Response Shape (We only need these fields):**
  ```json
  {
    "results": [
      {
        "id": 603,
        "title": "The Matrix",
        "poster_path": "/f89U3ADr1oiB1s9Gz0gSbn0QhTm.jpg",
        "release_date": "1999-03-30"
      }
    ]
  }
  ```

**2. Endpoint: `GET /search/tv`**
- **Purpose:** To find TV shows by title for the logging form.
- **Key Parameters:**
    - `query`: The user's search string.
- **Sample Response Shape (We only need these fields):**
  ```json
  {
    "results": [
      {
        "id": 1399,
        "name": "Game of Thrones",
        "poster_path": "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
        "first_air_date": "2011-04-17"
      }
    ]
  }
  ```
  
**3. Endpoint: `GET /movie/{movie_id}`**
- **Purpose:** To fetch detailed information for a specific movie after it's selected from search results or when viewing its page.
- **Sample Response Shape (Fields we need):**
  ```json
  {
    "id": 603,
    "title": "The Matrix",
    "overview": "Set in the 22nd century...",
    "poster_path": "/f89U3ADr1oiB1s9Gz0gSbn0QhTm.jpg",
    "backdrop_path": "/gSltkGE2T1iMV1M02k3E3i5kO1.jpg",
    "release_date": "1999-03-30",
    "runtime": 136,
    "genres": [
      { "id": 28, "name": "Action" }
    ]
  }
  ```

**4. Endpoint: `GET /tv/{tv_id}`**
- **Purpose:** To fetch detailed information for a TV show, including a list of its seasons.
- **Sample Response Shape (Fields we need):**
  ```json
  {
    "id": 1399,
    "name": "Game of Thrones",
    "overview": "Seven noble families fight for control...",
    "poster_path": "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    "backdrop_path": "/2OMB0ynKlyIenMidqLoTEoB3ku4.jpg",
    "first_air_date": "2011-04-17",
    "number_of_seasons": 8,
    "episode_run_time": [60],
    "genres": [
      { "id": 10765, "name": "Sci-Fi & Fantasy" }
    ],
    "seasons": [
        {
            "air_date": "2011-04-17",
            "episode_count": 10,
            "id": 3624,
            "name": "Season 1",
            "poster_path": "/zwaj4egrhnXJ_HkLT3wB3xK1S0S.jpg",
            "season_number": 1
        }
    ]
  }
  ```
  
**5. Endpoint: `GET /tv/{tv_id}/season/{season_number}`**
- **Purpose:** To fetch the list of episodes for a specific season, enabling users to log a whole season or individual episodes.
- **Sample Response Shape (Fields we need):**
  ```json
  {
    "id": 3624,
    "name": "Season 1",
    "season_number": 1,
    "episodes": [
      {
        "id": 63056,
        "name": "Winter Is Coming",
        "episode_number": 1,
        "air_date": "2011-04-17",
        "still_path": "/xIfvIM7YGKBU6PgM2LpJOL4SgE.jpg"
      }
    ]
  }
  ```

---
*This document should be updated whenever a new TMDB endpoint is integrated into the application.*

This document provides a clear and focused contract for your development team. It tells them exactly what data they can expect to work with and how to handle basics like image URLs, which will prevent a lot of common bugs and save significant development time.