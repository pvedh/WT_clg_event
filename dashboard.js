const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const LOG_FILE = path.join(__dirname, "logs", "app.log");

// Read and analyse Winston logs
function getLogStats() {
    if (!fs.existsSync(LOG_FILE)) {
        return { total: 0, methods: {}, statuses: {}, recent: [] };
    }

    const lines = fs.readFileSync(LOG_FILE, "utf8")
        .split("\n")
        .filter(Boolean);

    const methods = {};
    const statuses = {};
    const recent = [];

    lines.forEach(line => {
        const match = line.match(
            /^(\S+) info: (GET|POST|PATCH|DELETE) (\S+) (\d{3})$/
        );

        if (match) {
            const [, timestamp, method, url, status] = match;

            methods[method] = (methods[method] || 0) + 1;
            statuses[status] = (statuses[status] || 0) + 1;

            recent.push({ timestamp, method, url, status });
        }
    });

    return {
        total: recent.length,
        methods,
        statuses,
        recent: recent.slice(-10).reverse()
    };
}

// Dashboard API
app.get("/api/stats", (req, res) => {
    res.json(getLogStats());
});

// Dashboard webpage
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>DevOps Monitoring Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f1f5f9;
            margin: 0;
            padding: 25px;
            color: #1e293b;
        }

        h1 { color: #0f172a; }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 18px;
            margin: 25px 0;
        }

        .card {
            background: white;
            padding: 22px;
            border-radius: 12px;
            box-shadow: 0 2px 8px #0001;
        }

        .number {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
        }

        .panel {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
        }

        th { background: #f8fafc; }

        .status {
            color: #15803d;
            font-weight: bold;
        }

        .refresh {
            color: #64748b;
            font-size: 13px;
        }
    </style>
</head>

<body>
    <h1>DevOps Monitoring Dashboard</h1>
    <p>Student CRUD Application | Roll No: 23071A05B1</p>
    <p class="refresh">Automatically refreshes every 5 seconds</p>

    <div class="cards">
        <div class="card">
            <h3>Total API Requests</h3>
            <div class="number" id="total">0</div>
        </div>

        <div class="card">
            <h3>GET Requests</h3>
            <div class="number" id="get">0</div>
        </div>

        <div class="card">
            <h3>POST Requests</h3>
            <div class="number" id="post">0</div>
        </div>

        <div class="card">
            <h3>Successful Responses</h3>
            <div class="number" id="success">0</div>
        </div>
    </div>

    <div class="panel">
        <h2>HTTP Method Statistics</h2>
        <div id="methods">Loading...</div>
    </div>

    <div class="panel">
        <h2>HTTP Status Codes</h2>
        <div id="statuses">Loading...</div>
    </div>

    <div class="panel">
        <h2>Recent API Activity</h2>
        <table>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Method</th>
                    <th>URL</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="logs"></tbody>
        </table>
    </div>

    <script>
        async function updateDashboard() {
            try {
                const response = await fetch("/api/stats");
                const data = await response.json();

                document.getElementById("total").textContent = data.total;
                document.getElementById("get").textContent =
                    data.methods.GET || 0;
                document.getElementById("post").textContent =
                    data.methods.POST || 0;

                const successful = Object.entries(data.statuses)
                    .filter(([code]) => code.startsWith("2"))
                    .reduce((sum, [, count]) => sum + count, 0);

                document.getElementById("success").textContent = successful;

                document.getElementById("methods").innerHTML =
                    Object.entries(data.methods)
                    .map(([method, count]) => method + ": " + count)
                    .join("<br>") || "No requests yet";

                document.getElementById("statuses").innerHTML =
                    Object.entries(data.statuses)
                    .map(([status, count]) => status + ": " + count)
                    .join("<br>") || "No responses yet";

                document.getElementById("logs").innerHTML =
                    data.recent.map(log => \`
                        <tr>
                            <td>\${log.timestamp}</td>
                            <td>\${log.method}</td>
                            <td>\${log.url}</td>
                            <td class="status">\${log.status}</td>
                        </tr>
                    \`).join("");

            } catch (error) {
                console.error("Dashboard error:", error);
            }
        }

        updateDashboard();
        setInterval(updateDashboard, 5000);
    </script>
</body>
</html>
    `);
});

app.listen(4000, () => {
    console.log("Monitoring Dashboard: http://localhost:4000");
});
