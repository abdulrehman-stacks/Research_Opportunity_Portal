University Research Opportunity Portal
Name: Abdul Rehman | Roll No: 24P-0518 | Class: BCS-5B
CN Assignment #01
GitHub Repository: https://github.com/abdulrehman-stacks/research-opportunity-portal

A research opportunity portal with a Node.js + Express REST API (`backend/`), a MySQL database (`database/`), a plain HTML/CSS/JavaScript + Bootstrap frontend (`frontend/`, served by Express) and an exported Postman collection (`postman/`)

## Prerequisites

Node.js 18+, MySQL 8+ with Workbench, Git, VS Code, Postman

## Setup (Windows 10, run in the project folder)

1. Create the database: open `database\schema.sql` in MySQL Workbench and click the lightning-bolt Run button (or run `mysql -u root -p -e "source database/schema.sql"`)
2. `copy .env.example .env`, then open `.env` and replace YOUR_MYSQL_PASSWORD with your MySQL password
3. `npm install`
4. `npm start` (prints "Server running at http://localhost:3000")
5. Open http://localhost:3000

## API

| Method | URL                    | Success | Errors   |
| ------ | ---------------------- | ------- | -------- |
| POST   | /api/opportunities     | 201     | 400, 500 |
| GET    | /api/opportunities     | 200     | 500      |
| GET    | /api/opportunities/:id | 200     | 400, 404 |
| PUT    | /api/opportunities/:id | 200     | 400, 404 |
| DELETE | /api/opportunities/:id | 200     | 400, 404 |

## Postman testing

1. Start the server (`npm start`).
2. In Postman click Import and choose `postman/Research-Opportunity-Portal.postman_collection.json`
3. Click the three dots on the collection, Run collection, Run
4. The 10 requests run in order and every test should pass: create x3 (201), get all (200), get one (200), update (200), close via PUT (200), delete (200), get deleted (404), invalid POST (400)

The collection variable `baseUrl` is `http://localhost:3000`. Created ids are saved automatically into `id1`, `id2`, `id3` by test scripts

To export again: three dots on the collection, Export, Collection v2.1, save into `postman/`

## Troubleshooting

- ECONNREFUSED: start MySQL (Windows Services, MySQL80, Start)
- Access denied: fix DB_PASSWORD in `.env`
- Unknown database: run `schema.sql` again
- EADDRINUSE: change PORT in `.env`
- Cannot GET /: run `npm start` from the folder that contains package.json
- CORS error: open http://localhost:3000, not the HTML file

## Git commands

```
git config --global user.name "Abdul Rehman"
git init
git branch -M main
git remote add origin https://github.com/abdulrehman-stacks/research-opportunity-portal.git
git add .gitignore .env.example package.json
git commit -m "chore: initialize project with gitignore and env example"
git add database
git commit -m "feat(db): add MySQL schema"
git add backend
git commit -m "feat(api): add Express server, CRUD endpoints, validation, error handling"
git add frontend/index.html frontend/style.css
git commit -m "feat(ui): add page layout with Bootstrap"
git add frontend/app.js
git commit -m "feat(ui): connect frontend to API with fetch"
git add postman
git commit -m "test: add Postman collection export"
git add README.md GUIDE.md EXPLANATION.md
git commit -m "docs: add README, guide and explanation"
git push -u origin main
```

## Requirements checklist

| Requirement                                                                  | Where                                  |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| 5 CRUD endpoints, codes 200/201/400/404/500                                  | backend/server.js                      |
| All CRUD uses MySQL, no hard-coded data                                      | backend/server.js, database/schema.sql |
| Frontend: list, details, create, update, close, delete, messages, validation | frontend/                              |
| Postman tests (8 required cases) and exported collection                     | postman/                               |
| GitHub link in README, no credentials                                        | README.md, .env.example, .gitignore    |
| Setup and run instructions                                                   | README.md                              |
