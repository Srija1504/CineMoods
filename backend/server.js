const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");


const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(
    express.json()
);


// =========================================================
// SETTINGS
// =========================================================

const PORT = 5000;

const mongoURI =
    process.env.MONGO_URI;

const tmdbToken =
    process.env.TMDB_ACCESS_TOKEN;


// =========================================================
// MONGODB
// =========================================================

const client =
    new MongoClient(mongoURI);


// =========================================================
// TMDB HELPER
// =========================================================

async function tmdbRequest(
    endpoint
) {

    if (
        !tmdbToken ||
        tmdbToken ===
        "YOUR_TMDB_ACCESS_TOKEN_HERE"
    ) {

        throw new Error(
            "TMDB access token is not configured."
        );

    }


    const response =
        await fetch(
            "https://api.themoviedb.org/3" +
            endpoint,
            {

                headers: {

                    accept:
                        "application/json",

                    Authorization:
                        `Bearer ${tmdbToken}`

                }

            }
        );


    if (!response.ok) {

        throw new Error(
            `TMDB request failed: ${response.status}`
        );

    }


    return await response.json();

}


// =========================================================
// START SERVER
// =========================================================

async function startServer() {

    try {

        await client.connect();


        console.log(
            "MongoDB connected successfully!"
        );


        const db =
            client.db("cinemoods");


        const users =
            db.collection("users");


        // =================================================
        // HOME
        // =================================================

        app.get(
            "/",
            (req, res) => {

                res.send(
                    "CineMoods Backend is running!"
                );

            }
        );


        // =================================================
        // SIGNUP
        // =================================================

        app.post(
            "/signup",
            async (req, res) => {

                try {

                    const {
                        name,
                        email,
                        password
                    } = req.body;


                    if (
                        !name ||
                        !email ||
                        !password
                    ) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "Please fill all fields."

                        });

                    }


                    const existingUser =
                        await users.findOne({
                            email
                        });


                    if (existingUser) {

                        return res.status(409).json({

                            success: false,

                            message:
                                "An account with this email already exists."

                        });

                    }


                    await users.insertOne({

                        name,

                        email,

                        password,

                        preferences: {

                            languages: [],

                            genres: [],

                            actors: []

                        },

                        createdAt:
                            new Date()

                    });


                    res.json({

                        success: true,

                        message:
                            "Account created successfully!"

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            "Signup failed."

                    });

                }

            }
        );


        // =================================================
        // LOGIN
        // =================================================

        app.post(
            "/login",
            async (req, res) => {

                try {

                    const {
                        email,
                        password
                    } = req.body;


                    const user =
                        await users.findOne({

                            email,

                            password

                        });


                    if (!user) {

                        return res.status(401).json({

                            success: false,

                            message:
                                "Invalid email or password."

                        });

                    }


                    res.json({

                        success: true,

                        message:
                            "Login successful!",

                        user: {

                            name:
                                user.name,

                            email:
                                user.email,

                            preferences:
                                user.preferences || {}

                        }

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            "Login failed."

                    });

                }

            }
        );


        // =================================================
        // SAVE PREFERENCES
        // =================================================

        app.post(
            "/preferences",
            async (req, res) => {

                try {

                    const {
                        email,
                        preferences
                    } = req.body;


                    if (
                        !email ||
                        !preferences
                    ) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "Missing preference information."

                        });

                    }


                    await users.updateOne(

                        {
                            email
                        },

                        {
                            $set: {

                                preferences,

                                updatedAt:
                                    new Date()

                            }

                        }

                    );


                    res.json({

                        success: true,

                        message:
                            "Preferences saved."

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            "Unable to save preferences."

                    });

                }

            }
        );


        // =================================================
        // GET MOVIES
        // =================================================

        app.get(
            "/api/movies",
            async (req, res) => {

                try {

                    const data =
                        await tmdbRequest(
                            "/discover/movie" +
                            "?include_adult=false" +
                            "&include_video=false" +
                            "&language=en-US" +
                            "&page=1" +
                            "&sort_by=popularity.desc"
                        );


                    res.json({

                        success: true,

                        results:
                            data.results || []

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            error.message

                    });

                }

            }
        );


        // =================================================
        // SEARCH
        // =================================================

        app.get(
            "/api/search",
            async (req, res) => {

                try {

                    const query =
                        req.query.query;


                    if (!query) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "Search query is required."

                        });

                    }


                    const data =
                        await tmdbRequest(

                            "/search/multi" +
                            "?query=" +
                            encodeURIComponent(query) +
                            "&include_adult=false" +
                            "&language=en-US" +
                            "&page=1"

                        );


                    const results =
                        (data.results || [])
                            .filter(
                                item =>
                                    item.media_type ===
                                    "movie" ||
                                    item.media_type ===
                                    "tv"
                            );


                    res.json({

                        success: true,

                        results

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            error.message

                    });

                }

            }
        );


        // =================================================
        // MOVIE DETAILS
        // =================================================

        app.get(
            "/api/movie/:id",
            async (req, res) => {

                try {

                    const id =
                        req.params.id;


                    const movie =
                        await tmdbRequest(
                            `/movie/${id}?language=en-US`
                        );


                    res.json({

                        success: true,

                        movie

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            error.message

                    });

                }

            }
        );


        // =================================================
        // MOVIE OTT / WATCH PROVIDERS
        // =================================================

        app.get(
            "/api/movie/:id/providers",
            async (req, res) => {

                try {

                    const id =
                        req.params.id;


                    const data =
                        await tmdbRequest(
                            `/movie/${id}/watch/providers`
                        );


                    const india =
                        data.results?.IN || null;


                    res.json({

                        success: true,

                        country:
                            "IN",

                        providers:
                            india

                    });

                } catch (error) {

                    console.error(
                        error
                    );


                    res.status(500).json({

                        success: false,

                        message:
                            error.message

                    });

                }

            }
        );


        // =================================================
        // SERVER
        // =================================================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

    }

}


startServer();