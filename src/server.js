import express from 'express';
import { ENV } from './config/env.js';
import { db } from './config/db.js';
import { favouritesTable } from './db/schema.js';
import { and, eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: true });
});

app.post("/api/favourites", async(req, res) => {
  // Logic to add a recipe to favourites
  try {
    
    const{ userId, recipeId, title, image, cookTime, servings } = req.body;

    // Validate input
    if(!userId || !recipeId || !title || !image || !cookTime || !servings) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavourite = await db.insert(favouritesTable).values({
      userId,
      recipeId,
      title,
      image,
      cookTime,
      servings,
    }).returning();
    //Return the newly created favourite
    res.status(201).json(newFavourite[0]);

  } catch (error) {
    //Handle errors appropriately
    console.log("Error adding to favourites:", error);
    res.status(500).json({ error: "Failed to add to favourites" });
  }
});  

app.get("/api/favourites/:userId", async(req, res) =>{
  try {

    const {userId} = req.params;

    const userFavourites = await db.select().from(favouritesTable).where(
      eq(favouritesTable.userId, userId)
    )

    res.json(userFavourites)

  } catch (error) {
    console.log("Error fetching a favourite:", error);
    res.status(500).json({ error: "Failed to fetch" });
  }
})

app.delete("/api/favourites/:userId/:recipeId", async(req, res) =>{

  try {

    const { userId, recipeId } = req.params

    await db
    .delete(favouritesTable)
    .where(
      and(eq(favouritesTable.userId,userId), eq(favouritesTable.recipeId,parseInt(recipeId)))
    );

    res.status(200).json({message: "Recipe deleted successfully!"})
  
  } catch (error) {

    console.log("Error removing a favourite:", error);
    res.status(500).json({ error: "Failed to remove" });

  }
})
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});