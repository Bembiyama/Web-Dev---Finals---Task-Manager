# Dynamic Single-Page Task Manager

## Overview

This project is a dynamic single-page task manager application that uses JavaScript, Web APIs, and WebSockets. The app allows users to add, complete, delete, and manage tasks in real-time. It demonstrates various web development concepts such as DOM manipulation, fetching data from APIs, and real-time updates using WebSockets.

## Purpose

This application is designed for family use to help each household manage their daily tasks efficiently. It includes features such as a weather indicator, inspirational quotes, and a user-friendly interface to enhance the task management experience.

## Features

- **Real-Time Task Management**: Add, complete, delete, and manage tasks in real-time.
- **Inspirational Quotes**: Fetches and displays inspirational quotes for each task.

## Technologies Used

- **JavaScript**: For DOM manipulation and dynamic content updates.
- **Web APIs**: Fetches data from two public APIs (Quotes API and Weather API).
- **WebSockets**: Enables real-time updates by setting up a WebSocket server.

## Installation and Setup

Ensure you have Node.js installed on your local device.

### Steps:

1. **Clone the Repository**

   ```bash
   git clone <repository-url>

2. **Navigate to the Project Directory:**

   ```bash
   cd <project-directory>

3. **Install Dependencies:**

   ```bash
   npm instal

4. **Start the WebSocket Server:**

   ```bash
   node server.js

5. **Open the Web Application:**   

    Open index.html in your preferred web browser to interact with the Task Manager.


## Project Structure

   ## package.json
    Defines the project dependencies, including the WebSocket library (ws).

   ## package-lock.json
    Locks the dependencies to specific versions to ensure consistency across installations.

   ## server.js
    Sets up the WebSocket server to handle real-time updates for task management.

   ## script.js
    Holds the function api and fetch the programs needs inorder for it to run properly and with its features.

   ## style.css
    The interface design for it to be user friendly and easy usability.