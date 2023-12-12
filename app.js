const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { isValid, format } = require("date-fns");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const statusArr = ["TO DO", "IN PROGRESS", "DONE"];
const priorityArr = ["HIGH", "MEDIUM", "LOW"];
const categoryArr = ["WORK", "HOME", "LEARNING"];

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is listening to port: 3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API-1
app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q } = request.query;
  switch (true) {
    case priority !== undefined && status !== undefined:
      if (!priorityArr.includes(priority)) {
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      }
      if (!statusArr.includes(status)) {
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      }
      const QueryPS = `select id, todo, priority, status, category, due_date as dueDate from todo where priority='${priority}' and status='${status}';`;
      const arrayPS = await db.all(QueryPS);
      response.send(arrayPS);
      break;

    case status !== undefined && category !== undefined:
      if (!statusArr.includes(status)) {
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      }
      if (!categoryArr.includes(category)) {
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      }
      const QueryCS = `select id, todo, priority, status, category, due_date as dueDate from todo where category='${category}' and status='${status}';`;
      const arrayCS = await db.all(QueryCS);
      response.send(arrayCS);
      break;

    case priority !== undefined && category !== undefined:
      if (!priorityArr.includes(priority)) {
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      }
      if (!categoryArr.includes(category)) {
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      }
      const QueryCP = `select id, todo, priority, status, category, due_date as dueDate from todo where category='${category}' and priority='${priority}';`;
      const arrayCP = await db.all(QueryCP);
      response.send(arrayCP);
      break;

    case status !== undefined:
      if (!statusArr.includes(status)) {
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      }
      const QueryS = `select id, todo, priority, status, category, due_date as dueDate from todo where status='${status}';`;
      const arrayS = await db.all(QueryS);
      response.send(arrayS);
      break;

    case priority !== undefined:
      if (!priorityArr.includes(priority)) {
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      }
      const QueryP = `select id, todo, priority, status, category, due_date as dueDate from todo where priority='${priority}';`;
      const arrayP = await db.all(QueryP);
      response.send(arrayP);
      break;

    case category !== undefined:
      if (!categoryArr.includes(category)) {
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      }
      const QueryC = `select id, todo, priority, status, category, due_date as dueDate from todo where category='${category}';`;
      const arrayC = await db.all(QueryC);
      response.send(arrayC);
      break;

    case search_q !== undefined:
      const QueryT = `select id, todo, priority, status, category, due_date as dueDate from todo where todo like '%${search_q}%';`;
      const arrayT = await db.all(QueryT);
      response.send(arrayT);
      break;
  }
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const queryTodoId = `select id, todo, priority, status, category, due_date as dueDate from todo where id=${todoId};`;
  const getTodo = await db.get(queryTodoId);
  response.send(getTodo);
});

//API-3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const newDate = new Date(date);
  if (isValid(newDate) === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const dateF = format(newDate, "yyyy-MM-dd");
    const queryDate = `select id, todo, priority, status, category, due_date as dueDate from todo where due_date='${dateF}';`;
    const dateArr = await db.all(queryDate);
    response.send(dateArr);
  }
});

//API-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const newDate = new Date(dueDate);

  switch (true) {
    case isValid(newDate) === false:
      response.status(400);
      response.send("Invalid Due Date");
      break;

    case !statusArr.includes(status):
      response.status(400);
      response.send("Invalid Todo Status");
      break;

    case !priorityArr.includes(priority):
      response.status(400);
      response.send("Invalid Todo Priority");
      break;

    case !categoryArr.includes(category):
      response.status(400);
      response.send("Invalid Todo Category");
      break;

    default:
      const dateF = format(newDate, "yyyy-MM-dd");
      const queryPost = `insert into todo (id, todo, priority, status, category, due_date) values (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dateF}');`;
      await db.run(queryPost);
      response.send("Todo Successfully Added");
      break;
  }
});

//API-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  const newDate = new Date(dueDate);
  switch (true) {
    case status !== undefined:
      if (!statusArr.includes(status)) {
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      }
      const QueryS = `update todo set status='${status}' where id=${todoId};`;
      await db.run(QueryS);
      response.send("Status Updated");
      break;

    case priority !== undefined:
      if (!priorityArr.includes(priority)) {
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      }
      const QueryP = `update todo set priority='${priority}' where id=${todoId};`;
      await db.run(QueryP);
      response.send("Priority Updated");
      break;

    case category !== undefined:
      if (!categoryArr.includes(category)) {
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      }
      const QueryC = `update todo set category='${category}' where id=${todoId};`;
      await db.run(QueryC);
      response.send("Category Updated");
      break;

    case dueDate !== undefined:
      if (isValid(newDate) === false) {
        response.status(400);
        response.send("Invalid Due Date");
        break;
      } else {
        const dateF = format(newDate, "yyyy-MM-dd");
        const QueryD = `update todo set due_date='${dateF}' where id=${todoId};`;
        await db.run(QueryD);
        response.send("Due Date Updated");
        break;
      }

    case todo !== undefined:
      const queryTodo = `update todo set todo='${todo}' where id=${todoId};`;
      await db.run(queryTodo);
      response.send("Todo Updated");
      break;
  }
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const queryDelete = `delete from todo where id=${todoId};`;
  await db.run(queryDelete);
  response.send("Todo Deleted");
});

module.exports = app;
