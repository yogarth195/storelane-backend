const express = require("express");
const cors = require("cors");
const mainRoute = require("./routes/mainRoute");
const app = express();
const path = require("path")
require("dotenv").config();


const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/websaarthi", mainRoute);

app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (req, res)=> {
    res.json({
        message: "you cannot be on this page"
    });
})


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
