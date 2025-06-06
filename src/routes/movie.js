const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const Movie = require("../models/Movie");
const CategoriesMovies = require("../models/CategoriesMovies");
const { default: mongoose } = require("mongoose");

// Create movie
router.post("/", authentication.verify, async (req, res) => {
  if (req.user.role === "admin") {
    const newMovie = new Movie(req.body);
    try {
      const movie = await newMovie.save();
      res.status(201).json(movie);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You do not have the right to add movies!");
  }
});

// Update movie
router.put("/:id", authentication.verify, async (req, res) => {
  try {
    const updateMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    res.status(200).json(updateMovie);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete movie
router.delete("/:movieId", authentication.verify, async (req, res) => {
  const existsMovieInCategory =
    req.body.ids &&
    (await CategoriesMovies.find({
      _id: !!req.body.ids.length ? req.body.ids.map((el) => el) : null,
    }));
  const movieId = req.params.movieId;
  if (req.user.role === "admin") {
    try {
      if (existsMovieInCategory) {
        await CategoriesMovies.updateMany(
          {
            _id:
              req.body.ids &&
              !!req.body.ids.length &&
              req.body.ids.map((el) => el),
          },
          {
            $pullAll: {
              content: [{ _id: movieId }],
            },
          }
        );
      }
      await Movie.findByIdAndDelete(mongoose.Types.ObjectId(movieId));
      res.status(200).json("Filmul cu id-ul " + movieId + " a fost șters!");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You do not have the right to delete movies!");
  }
});

// Get all movies
router.get("/", authentication.verify, async (req, res) => {
  const query = req.query.new;
  try {
    const movies = query
      ? (await Movie.find().sort({ _id: -1 }).limit(3)).reverse()
      : await Movie.find();
    res.status(200).json(movies.reverse());
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one movie
router.get("/find/:id", authentication.verify, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get random movies
router.get("/randomMovie", authentication.verify, async (req, res) => {
  try {
    const movie = await Movie.aggregate([{ $sample: { size: 1 } }]);
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get movies statistics by genre
router.get("/statistics", authentication.verify, async (req, res) => {
  if (req.user.role === "admin") {
    try {
      const data = await CategoriesMovies.aggregate([
        {
          $project: {
            Genre: { _id: "$genre" },
          },

        },
        {
          $group: {
            _id: "$Genre",
            total: { $sum: 1 },
          },
        },
        // {
        //   $group: {
        //     _id: "$genre", // Directly group by genre string
        //     total: { $sum: 1 },
        //   },
        // },

      ]);    
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(500)
      .json(
        "Only the administrator can view the statistics related to the number of movies by genre!"
      );
  }
});

// Get total number of movies
router.get(
  "/total-number-of-movies",
  authentication.verify,
  async (req, res) => {
    if (req.user.role === "admin") {
      Movie.count({}, function (error, result) {
        if (error) {
          res.send(error);
        } else {
          res.json(result);
        }
      });
    } else {
      res
        .status(500)
        .json("Only the administrator can see the total number of movies!");
    }
  }
);

module.exports = router;
