const ws = new WebSocket('ws://localhost:8080');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

ws.onopen = function() {
    console.log('Connected to WebSocket server');
    if (tasks.length > 0) {
        tasks.forEach(task => {
            if (isValidTask(task)) {
                createTaskElement(task);
                checkTaskExpiration(task);
            }
        });
    }
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
        tasks = data.tasks.filter(isValidTask);
        tasks.forEach(task => {
            createTaskElement(task);
            checkTaskExpiration(task);
        });
        saveTasksToLocalStorage();
    } else if (data.type === 'add') {
        if (isValidTask(data.task)) {
            createTaskElement(data.task);
            tasks.push(data.task);
            saveTasksToLocalStorage();
            checkTaskExpiration(data.task);
        }
    } else if (data.type === 'complete') {
        completeTaskById(data.id);
    } else if (data.type === 'delete') {
        deleteTaskById(data.id);
    } else if (data.type === 'expire') {
        expireTaskById(data.id);
    }
};

function isValidTask(task) {
    return task && task.name && task.text && !isNaN(task.deadline) && task.deadline > 0;
}

function addTask() {
    var nameInput = document.getElementById("nameInput");
    var taskInput = document.getElementById("taskInput");
    var taskDeadline = document.getElementById("taskDeadline").value;

    var name = nameInput.value.trim();
    var taskText = taskInput.value.trim();
    nameInput.value = "";
    taskInput.value = "";
    document.getElementById("taskDeadline").value = "";

    if (name === "" || taskText === "" || taskDeadline === "") {
        alert("Please enter your name, a task, and a deadline!");
        return;
    }

    const deadlineTimestamp = new Date(taskDeadline).getTime();
    if (isNaN(deadlineTimestamp) || deadlineTimestamp <= Date.now()) {
        alert("Please enter a valid future deadline!");
        return;
    }

    const task = { id: Date.now(), name: name, text: taskText, deadline: deadlineTimestamp, completed: false, notified: false };
    ws.send(JSON.stringify({ type: 'add', task }));
}

function createTaskElement(task) {
    if (!isValidTask(task)) {
        return;
    }

    var taskList = document.getElementById("taskList");
    var li = document.createElement("li");
    li.id = task.id;

    var taskText = document.createElement("span");
    var taskDescription = `(${task.name}): ${task.text}`;
    taskText.textContent = taskDescription;

    var taskDeadline = document.createElement("span");
    taskDeadline.textContent = ` (Deadline: ${new Date(task.deadline).toLocaleString()})`;
    taskDeadline.classList.add("deadline");

    var completeButton = document.createElement("button");
    completeButton.textContent = "Complete";
    completeButton.onclick = function() {
        ws.send(JSON.stringify({ type: 'complete', id: task.id }));
    };

    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function() {
        ws.send(JSON.stringify({ type: 'delete', id: task.id }));
    };

    li.appendChild(taskText);
    li.appendChild(taskDeadline);
    li.appendChild(completeButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);

    if (task.completed) {
        completeTask(li);
    }

    checkTaskExpiration(task);
}

function completeTask(taskItem) {
    var taskText = taskItem.querySelector("span");
    taskText.style.textDecoration = "line-through";
    taskText.style.color = "gray";
    taskItem.classList.add("completed");
    taskItem.style.backgroundColor = "lightblue";

    const taskId = parseInt(taskItem.id, 10);
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = true;
        saveTasksToLocalStorage();
    }
}

function completeTaskById(id) {
    const taskItem = document.getElementById(id);
    if (taskItem) {
        completeTask(taskItem);
    }
}

function deleteTask(taskItem) {
    taskItem.remove();
    saveTasksToLocalStorage();
}

function deleteTaskById(id) {
    const taskItem = document.getElementById(id);
    if (taskItem) {
        taskItem.remove();
        tasks = tasks.filter(task => task.id !== id);
        saveTasksToLocalStorage();
    }
}

function expireTask(taskItem) {
    taskItem.classList.add("expired");
    taskItem.style.backgroundColor = "lightcoral";
}

function expireTaskById(id) {
    const taskItem = document.getElementById(id);
    if (taskItem) {
        const now = Date.now();
        const task = tasks.find(task => task.id === id);
        if (task && !task.completed && !task.notified) {
            notifyTaskExpiration(task.text);
            task.notified = true;
            saveTasksToLocalStorage();
        }
        if (task && !task.completed) {
            taskItem.classList.add("expired");
            taskItem.style.backgroundColor = "lightcoral";
        }
    }
}

function notifyTaskExpiration(taskText) {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return;
    }

    const taskDescription = taskText || "Task Expired";

    if (Notification.permission === "granted") {
        new Notification("Task Expired", { body: taskDescription });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Task Expired", { body: taskDescription });
            }
        });
    }
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function checkTaskExpiration(task) {
    const now = Date.now();
    const timeRemaining = task.deadline - now;

    if (timeRemaining <= 0) {
        expireTaskById(task.id);
    } else {
        setTimeout(() => {
            expireTaskById(task.id);
        }, timeRemaining);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayMotivationalQuote();
    updateTime();
    updateVerse();
    setInterval(updateTime, 1000);
    setInterval(updateVerse, 24 * 60 * 60 * 1000);
});

function fetchAndDisplayMotivationalQuote() {
    fetch('https://api.quotable.io/random')
        .then(response => response.json())
        .then(data => {
            const motivationalQuoteElement = document.getElementById('motivationalQuote');
            motivationalQuoteElement.textContent = data.content;
        })
        .catch(error => {
            console.error('Error fetching quote:', error);
        });
}

function updateTime() {
    const now = new Date();
    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);

    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    dateElement.textContent = "Date: " + formattedDate;
    timeElement.textContent = "Time: " + formattedTime;
}

function updateVerse() {
    fetch('https://labs.bible.org/api/?passage=votd&type=json')
        .then(response => response.json())
        .then(data => {
            const verse = data[0].text;
            document.getElementById("verse").textContent = verse;
        })
        .catch(error => {
            console.error('Error fetching verse:', error);
            document.getElementById("verse").textContent = "Failed to load verse.";
        });
}
