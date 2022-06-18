import express from "express";
import { homeData, roundData } from "./controllers/resultadosController.js";
import { matchData } from "./controllers/matchController.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next()

    app.options('*', (req, res) => {
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send()
    })
})

app.get('/api', homeData)
app.get('/api/round/:round', roundData)
app.get('/api/:partidoId/:local/:visitante', matchData)

app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`)
})