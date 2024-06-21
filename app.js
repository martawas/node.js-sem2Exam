require("dotenv").config();
const express = require("express");
const app = express();

const {
  init,
  getAds,
  getAd,
  deleteAd,
  addAd,
  updateAd,
  searchAds,
} = require("./db");

app.use(express.json());

init()
  .then(() => {
    app.post("/ads", async (req, res) => {
      try {
        const newAd = req.body;

        if (
          !newAd.title ||
          !newAd.description ||
          !newAd.author ||
          !newAd.category ||
          !newAd.tags ||
          !newAd.price ||
          !newAd.location
        ) {
          return res.status(400).send("Missing parameters");
        }
        const result = await addAd(newAd);
        res.status(201).send({ id: result.insertedId });
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/ads", async (req, res) => {
      try {
        const ads = await getAds();
        res.send(ads);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/ads/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const ad = await getAd(id);
        if (!ad) {
          return res.status(404).send("Advertisment doesn't exist!");
        }

        res.format({
          "text/plain": () => {
            res.send(
              `Tytuł: ${ad.title}\n
              Opis: ${ad.description}\n
              Autor: ${ad.author}\n
              Kategoria: ${ad.category}\n
              Tagi: ${ad.tags}\n
              Cena: ${ad.price}\n
              Lokalizacja: ${ad.location}`
            );
          },
          "text/html": () => {
            res.send(
              `
                <h1>${ad.title}</h1>
                <p>${ad.description}</p>
                <p>Autor: ${ad.author}</p>
                <p>Kategoria: ${ad.category}</p>
                <p>Tagi: ${ad.tags}</p>
                <p>Cena: ${ad.price}</p>
                <p>Lokalizacja: ${ad.location}</p>
                `
            );
          },
          "application/json": () => {
            res.json(ad);
          },
        });
      } catch (error) {
        res.status(500).send("Internal server error");
      }
    });

    app.patch("/ads/:id", async (req, res) => {
      const { id } = req.params;
      const updatedFields = req.body;

      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        return res.status(400).send("Bad Request: No fields to update");
      }

      try {
        const result = await updateAd(id, updatedFields);

        if (result.modifiedCount === 1) {
          return res.status(204).send("Advertisement modified correctly");
        } else if (result.matchedCount === 1) {
          return res
            .status(409)
            .send("Conflict: No changes were made to the advertisement");
        } else {
          return res
            .status(404)
            .send("Not Found: Advertisement does not exist");
        }
      } catch (error) {
        return res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/ads/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await deleteAd(id);

        if (result.deletedCount == 1) {
          res.status(204).send();
        } else {
          res.status(404).send("Not Found: Advertisement does not exist");
        }
      } catch (error) {
        return res.status(500).send("Internal Server Error");
      }
    });

    app.get("/search", async (req, res) => {
      try {
        const { query } = req;
        if (query.minPrice && query.maxPrice) {
          const minPrice = parseFloat(query.minPrice);
          const maxPrice = parseFloat(query.maxPrice);

          if (minPrice > maxPrice) {
            return res
              .status(400)
              .send("minPrice cannot be greater than maxPrice");
          }
        }
        const filteredAds = await searchAds(query);
        res.json(filteredAds);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
  })

  .finally(() => {
    app.get("/heartbeat", (req, res) => {
      res.send(new Date());
    });

    app.listen(process.env.PORT, () => console.log("server started"));
  });
