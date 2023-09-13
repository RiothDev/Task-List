const express = require("express")
const mysql = require("mysql")
const http = require("http")
const path = require("path")

const app = express()
const server = http.createServer(app)

const port = 8080

app.use(express.static(path.join(__dirname + "/public")))

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "main_data"
});

function getData(query, callback) {
    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null)
            return
        }

        callback(null, results)
    })
}

app.get("/", (req, res) => res.sendFile(path.join(__dirname + "/index.html")))

app.get("/removeTask", (req, res) => {
    const task = req.query.task

    if(!task) {
        res.status(400).json({message: "Missing task"})
        return
    }

    connection.query(`DELETE FROM ${req.query.table} WHERE id = ?`, [task], (err) => {
        if(err) {
            console.error("Error trying to delete task: ", err)
            res.status(500).json({message: "Error deleting task"})
            return
        }

        res.json({message: "Success"})
    })
})

app.get("/getTasks", (req, res) => {
    getData(`SELECT task_name, id FROM ${req.query.table}`, (err, elements) => {
        if(err) {
            res.status(500).json({error: err})
            return
        }
        
        res.json({data: elements})
    })
})

app.get("/addTask", (req, res) => {
    const taskName = req.query.task

    if(!taskName) {
        res.status(400).json({message: "Missing task"})
        return
    }

    connection.query(`INSERT INTO ${req.query.table} (task_name) VALUES ("${taskName}");`, (err) => {
        if(err) {
            res.status(500).json({error: err})
            return
        }

        res.json({message: "Success"})
    })
})

connection.connect((err) => {
    if (err) {
        console.log("Error trying to fetch")

        console.error("Error trying to connect database", err)
        return;
    }

    console.log("> Connected to MySQL database");
})

server.listen(port, () => {
    console.log(`> Server running on port ${port} (http://localhost:${port})`)
})