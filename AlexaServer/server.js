import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { Firestore, App, Auth } from './firebase_config.js';
import { collection, addDoc, getDocs, doc } from "firebase/firestore";

const app = express();
const PORT = 3000;
let Data = []

//22/11/2024, 15:29:05

function ParseDate(DateString)
{
    return new Date
    (
        Number.parseInt(DateString.substring(6, 10)),
        Number.parseInt(DateString.substring(3, 5)),
        Number.parseInt(DateString.substring(0, 2)),
        Number.parseInt(DateString.substring(12, 14)),
        Number.parseInt(DateString.substring(15, 17)),
        Number.parseInt(DateString.substring(18)),
    )
}

const getData = async () =>
{
    Data = (await getDocs(collection(Firestore, "alexa"))).docs
    .map((item) => 
    {
        return item.data();
    });
}

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) =>
{
    await getData();
    res.setHeader('Content-Type', 'text/html');
    let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <h1>Dados dos dispositivos</h1>
        <table>
            <thead>
                <th>Dispositivo</th>
                <th>Valor</th>
                <th>Data/Hora</th>
            </thead>
            <tbody>`;
    Data.sort((x, y) =>
    {
        const datex = ParseDate(x.timestamp);
        const datey = ParseDate(y.timestamp);
        return datey - datex;
    }).forEach((item) =>
    {
        html = html + `
            <tr>
                <td>${item.device}</td>
                <td>${item.state}</td>
                <td>${item.timestamp}</td>
            </tr>`
    });
    html = html + `</tbody>
        </table>
    </body>
    </html>`;
    res.end(html);
});

app.post('/save', async (req, res) =>
{
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    console.log(req.body.device);
    console.log(req.body.state);
    console.log(timestamp);
    await addDoc(collection(Firestore, "alexa"), 
    {
        device: req.body.device,
        state: req.body.state,
        timestamp: timestamp
    })
    res.json({message: "inserted"})
});

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});
