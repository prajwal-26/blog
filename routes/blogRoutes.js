const express = require("express");
const axios = require("axios");
const _ = require("lodash");

const router = express.Router();


const apiUrl = "https://intent-kit-16.hasura.app/api/rest/blogs";
const apiKey =
  "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6";

// Define a memoization cache for each route handler
const cache = {
  blogStats: _.memoize(fetchBlogStats, (query) => createCacheKey(query)),
  blogSearch: _.memoize(searchBlogs, (query) => createCacheKey(query)),
};

router.get("/", (req, res) => {
    
        
    const route = 
    `<h1>${"Welcome to the Blog!"}</h1>`;
    res.send(route)
  });

// Middleware to fetch blog data and perform analytics
router.get("/blog-stats", async (req, res) => {
  try {
    // Call the memoized function for blog stats and pass the query parameter
    const data = await cache.blogStats("");

    // Format the data into HTML tags
    const formattedResponse = `
      <p>Total Blogs: ${data.totalBlogs}</p>
      <p>Longest Blog Title:</p>
      <pre>${JSON.stringify(data.longestBlogTitle, null, 2)}</pre>
      <p>BlogsWithPrivacy Count: ${data.blogsWithPrivacyCount}</p>
      <ul>
        <li>Unique Blog Titles:</li>
        <ul>
          ${data.uniqueBlogTitles.map((title) => `<li>${title}</li>`).join("")}
        </ul>
      </ul>
    `;

    // Send the formatted HTML response
    res.send(formattedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Blog search endpoint
router.get("/blog-search", async (req, res) => {
  const query = req.query.query;

  try {
    // Call the memoized function for blog search and pass the query parameter
    const data = await cache.blogSearch(query);

    if (data.results.length === 0) {
      res.status(404).json({ error: "No blogs found matching the query." });
    } else {
      // Format the search results into an HTML list
      const formattedResponse = `
        <ul>
          ${data.results.map((blog) => `<li>${blog.title}</li>`).join("")}
        </ul>
      `;

      // Send the formatted HTML response
      res.send(formattedResponse);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Define a function to fetch blog stats
async function fetchBlogStats() {
  const response = await axios.get(apiUrl, {
    headers: {
      "x-hasura-admin-secret": apiKey,
    },
  });

  const totalBlogs = _.size(response.data.blogs);
  const longestBlogTitle = _.maxBy(
    response.data.blogs,
    (blog) => blog.title.length
  );

  const blogsWithPrivacy = response.data.blogs.filter((blog) =>
    blog.title.toLowerCase().includes("privacy")
  );

  const uniqueBlogTitles = _.uniq(
    response.data.blogs.map((blog) => blog.title)
  );

  return {
    totalBlogs,
    longestBlogTitle,
    blogsWithPrivacyCount: blogsWithPrivacy.length,
    uniqueBlogTitles,
  };
}

// Define a function to create a cache key for memoization
function createCacheKey(query) {
  return query.toLowerCase();
}

// Define a function to search blogs
async function searchBlogs(query) {
  const response = await axios.get(apiUrl, {
    headers: {
      "x-hasura-admin-secret": apiKey,
    },
  });

  const searchResults = response.data.blogs.filter((blog) => {
    if (blog.title && typeof blog.title === "string") {
      return blog.title.toLowerCase().includes(query.toLowerCase());
    }
    return false;
  });

  return { results: searchResults };
}

module.exports = router;
