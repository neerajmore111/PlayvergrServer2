const router = require("express").Router();
const User = require("../models/User");
const authentication = require("../middlewares/authentication");
const accessKey = require("../utils/generateAccessKey");
const transporter = require("../utils/transporter");

// Register
router.post("/register", async (req, res) => {
  try {
    const user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      role:req.body.role
    });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Logout
router.post("/logout", authentication.verify, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ message: "Te-ai delogat cu succes!" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Request reset password
router.post("/reset-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.tokens = [];
      user.password = accessKey.generateAccessKey();
      const key = user.password;
      const msg = {
        from: process.env.USER,
        to: user.email,
        subject: "Password reset instructions",
        html: `<!doctype html>
          <html>
            <head>
            <style>
              img {
                width: 250px;
                height: 200px;
                display: block;
                margin-left: auto;
                margin-right: auto;
              }
              p, li {
                margin-left: 40px;
                font-size: 15px;
              } 
              .credentials {
                font-weight: 600;
              }
              .footer {
                position: fixed;
                left: 0;
                bottom: 0;
                width: 100%;
                color: black;
                text-align: right;
                font-style: oblique;
                font-weight: 700;
             }
             .userAccountSettings {
                font-style: oblique;
             }
             .team {
              font-style: oblique;
              text-align: right;
              font-weight: 700;
             }
             .name {
               color: red;
             }
             ul {
              list-style-type: disc;
             }
             a:link {
              color: blue;
              background-color: transparent;
              text-decoration: none;
            }
            a:hover {
              color: red;
              background-color: transparent;
            }
            .contactInfo {
              font-style: oblique;
            }
            </style>
              <meta charset="utf-8">
            </head>
            <body>
              <img src="https://t4.ftcdn.net/jpg/04/65/91/57/360_F_465915770_HsbKRqP7PQnoGnNn5dyYRlODYZQI9PNu.jpg" alt="image">
              <p>Hellow,</p>
              <p>You have received this email because you requested a password reset for your Stream20 account..</p>
              <p>Your login password has been changed, and as a result, you have been automatically logged out from all devices where you were previously logged in. 
              To log in again, navigate to the page of <a href="http://localhost:3000/welcome/login">Login</a> and fill in the form fields with the following information:</p>
              <ul>
                <li>email: <span class="credentials">${user.email}</span></li>
                <li>parolă: <span class="credentials">${key}</span></li>
              </ul>
              <p>After logging in, please change your password by accessing the page<a href="http://localhost:3000/user-account-settings">Profile settings</a>.</p>
              <p>If you have any questions regarding the login process, do not hesitate to contact us by email at <span class="contactInfo">hello@stream20.com</span>or by phone at the number <span class="contactInfo">+(91) 8719808771</span>.</p>
              <p>All the best!</p>
              <div>
                <p class="team">The Stream20 Team</p>
              </div>
              <div class="footer">
                <p>© 2022 <span class="name">Stream20</span>.All rights reserved!</p>
              </div>
            </body>
          </html>`,
      };
      const info = await transporter.sendMail(msg);
      console.log(info);
      await user.save();
      res.send({
        message:
          "All access tokens of the user " +
          user.username +
          "have been deleted!",
      });
    } else res.status(404).json("This email address does not exist!");
  } catch (error) {
    res.status(400).send(error);
  }
});

// send message to the administrator
router.post("/contact", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;
  const emailAddress = req.body.emailAddress;
  const message = req.body.message;
  const mail = {
    from: process.env.USER,
    to: process.env.YAHOO_MAIL,
    subject: "Message from " + firstName + " " + lastName,
    html: `<!doctype html>
      <html>
        <head>
          <style>
            img {
              width: 280px;
              height: 200px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            p, li {
              margin-left: 40px;
              font-size: 15px;
            } 
            .message {
              font-style: oblique;
            }
            .contactInfo {
              font-weight: 600;
            }
            .footer {
              position: fixed;
              left: 0;
              bottom: 0;
              width: 100%;
              color: black;
              text-align: right;
              font-style: oblique;
              font-weight: 700;
           }
           .name {
            color: red;
           }
          </style>
          <meta charset="utf-8">
        </head>
        <body>
           <img src="https://cdni.iconscout.com/illustration/premium/thumb/message-notification-in-laptop-with-coffee-cup-3178506-2670442.png" alt="image">
           <p>Good day, you have received a message from ${firstName} ${lastName}.</p>
           <p>The sent message is as follows:</p>
           <p class="message">${message}</p>
           <p>"If you wish to get in touch with${lastName} datele sale de contact pe care le-a furnizat sunt următoarele:</p>
           <ul>
            <li>First Name: <span class="contactInfo">${firstName}</span></li>
            <li>Last Name : <span class="contactInfo">${lastName}</span></li>
            <li>Email Address : <span class="contactInfo">${emailAddress}</span></li>
            <li>Phone No: <span class="contactInfo">${phoneNumber}</span></li>
           </ul>
           <div class="footer">
            <p>© 2025<span class="name">Stream20</span>. All rights reserved!</p>
           </div>
        </body>
      </html>`,
  };
  const info = await transporter.sendMail(mail);
  console.log(info);
  res.send({
    message: "A message has been sent!",
  });
});

// Update user
router.put("/:id", authentication.verify, async (req, res) => {
  if (req.user.id === req.params.id) {
    const updates = Object.keys(req.body);
    try {
      const { user } = req;
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      res.send(user);
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(500).json("You can only update your own account!");
  }
});

// Delete user
router.delete("/:id", authentication.verify, async (req, res) => {
  if (req.user.role === "admin") {
    try {
      await User.findByIdAndDelete(req.params.id);
      res
        .status(200)
        .json("The user with the ID" + req.params.id + " has been deleted!");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("The account can only be deleted by the administrator!");
  }
});

// Get all users
router.get("/", authentication.verify, async (req, res) => {
  const query = req.query.new;
  if (req.user.role !== "admin")
    return res.status(400).send({
      message:
        "Only the administrator can see the full list of users!",
    });
  try {
    const users = query
      ? (await User.find().sort({ _id: -1 }).limit(5)).reverse()
      : await User.find();
    res.status(200).json(users.reverse());
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get one user
router.get("/find/:id", authentication.verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.role === "admin") {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...info } = user._doc;
      res.status(200).json(info);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("You can only view the details of your own account!");
  }
});

// Get users statistics
router.get("/statistics", authentication.verify, async (req, res) => {
  if (req.user.role === "admin") {
    try {
      // const data = await User.aggregate([
      //   {
      //     $project: {
      //       Month: { $month: "$createdAt" },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$Month",
      //       total: { $sum: 1 },
      //     },
      //   },
      // ]);

      const data = await User.aggregate([
        {
          $match: {
            createdAt: { $ne: null },
          },
        },
        {
          $project: {
            Month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$Month",
            total: { $sum: 1 },
          },
        },
      ]);
      







      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(500)
      .json(
        "Only the administrator can see the statistics related to the number of registrations!"
      );
  }
});

// Get total number of users
router.get(
  "/total-number-of-users",
  authentication.verify,
  async (req, res) => {
    if (req.user.role === "admin") {
      User.count({}, function (error, result) {
        if (error) {
          res.send(error);
        } else {
          res.json(result);
        }
      });
    } else {
      res
        .status(500)
        .json("Only the administrator can see the total number of users!");
    }
  }
);

// Add watched movie to user
router.put("/:id/:movieId", authentication.verify, async (req, res) => {
  const { user } = req;
  const existsMovieInList =
    user.seenMovies && user.seenMovies.includes(req.params.movieId);
  if (!existsMovieInList) {
    if (req.user.id === req.params.id) {
      const updates = Object.keys(req.body);
      try {
        await User.findByIdAndUpdate(
          { _id: req.user.id },
          {
            $addToSet: {
              seenMovies: [{ _id: req.params.movieId }],
            },
          }
        );
        user.save();
        res.send(user);
      } catch (error) {
        res.status(400).send(error);
      }
    } else {
      res.status(500).json("The movie has been added to the watched movies list!");
    }
  } else return null;
});

module.exports = router;
