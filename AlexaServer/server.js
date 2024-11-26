import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { Firestore, App, Auth } from './firebase_config.js';
import { collection, addDoc, getDocs, doc } from "firebase/firestore";

const app = express();
const PORT = 3000;
let Data = []

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
    let device = req.query.device;
    await getData();
    res.setHeader('Content-Type', 'text/html');
    let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alexa Automation Server</title>
        <style>
            body
            {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            table
            {
                background-color: #0f0f0f;
                color: #f0f0f0;
            }
            td
            {
                color: #0f0f0f;
            }
            th
            {
                background-color: #202020;
            }
            th, td
            {
                text-align: center;
                min-width: 80px;
                padding-left: 5px;
                padding-right: 5px;
            }
            .row0
            {
                background-color: #f0f0f0;
            }
            .row1
            {
                background-color: #c0c0c0;
            }
        </style>
    </head>
    <body>
        <h1>Dados dos dispositivos</h1>
        <div style="display: flex; flex-direction: row; gap: 5px; align-items: center;">
            <p>Dispositivo:</p>
            <input type="text" id="device">
            <button onclick="Redirect()">Buscar</button>
        </div>
        <table>
            <thead>
                <th>Dispositivo</th>
                <th>Valor</th>
                <th>Data/Hora</th>
            </thead>
            <tbody>`;
    if(device != undefined)
    {
        Data = Data.filter((item) =>
        {
            return item.device.toLowerCase().indexOf(device.toLowerCase()) >= 0;
        })
    }
    Data.sort((x, y) =>
    {
        const datex = ParseDate(x.timestamp);
        const datey = ParseDate(y.timestamp);
        return datey - datex;
    }).forEach((item, index) =>
    {
        html = html + `
            <tr class="row${index%2}">
                <td>${item.device}</td>
                <td>${item.state}</td>
                <td>${item.timestamp}</td>
            </tr>`
    });
    html = html + `</tbody>
        </table>
        <script>
            function Redirect()
            {
                let path = "/";
                let device = document.getElementById("device").value;
                if(device !== "")
                {
                    path = \`/?device=\${device}\`
                }
                window.location.href = path;
            }
        </script>
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
