# Call Data Management API

## Overview

This API allows you to manage call data stored in a Supabase database. It includes endpoints for creating, retrieving, updating, and deleting call records.

## Table Schema

The Supabase table `call_data` has the following schema:

```sql
CREATE TABLE call_data (
  id BIGSERIAL PRIMARY KEY,
  caller VARCHAR NOT NULL,
  callee VARCHAR NOT NULL,
  call_duration INTEGER NOT NULL,  -- Duration in seconds
  call_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
## Project Structure
```
/project-root
|-- /config
|   |-- supabaseClient.js
|-- /controllers
|   |-- callController.js
|-- /models
|   |-- callModel.js
|-- /routes
|   |-- callRoutes.js
|-- /src
|   |-- index.js
|-- .env
|-- package.json
|-- README.md
```
## Setup
- ## Prerequisites
  - Node.js (v14 or later)
  - npm
  - Supabase account with an existing project
    
## Installation

- Clone the repository:
  
```
  git clone https://github.com/abhishek09827/synthiq-trial.git
```
- Install dependencies:
  ```
  npm install

  ```
- Create a .env file in the root directory with the following content:
  ```
  SUPABASE_URL=your-supabase-url
  SUPABASE_KEY=your-supabase-key

  ```
## API Endpoints

### 1. **Create a New Call**

- **Endpoint**: `POST /api/calls`
- **Description**: Adds a new call record to the database.

**Request**:
```bash
curl -X POST http://localhost:3000/api/calls \
-H "Content-Type: application/json" \
-d '{
  "caller": "John Doe",
  "callee": "Jane Smith",
  "call_duration": 450,  // Duration in seconds
  "call_date": "2024-09-12T09:30:00.000Z"
}'
```
**Response:**
{
  "id": 1,
  "caller": "John Doe",
  "callee": "Jane Smith",
  "call_duration": 450,
  "call_date": "2024-09-12T09:30:00.000Z"
}
### 2.**Get All Calls**
Endpoint: GET /api/calls
Description: Fetches all call records from the database.
**Request:**
```bash
curl -X GET http://localhost:3000/api/calls
```
**Response:**
```bash
[
  {
    "id": 1,
    "caller": "John Doe",
    "callee": "Jane Smith",
    "call_duration": 450,
    "call_date": "2024-09-12T09:30:00.000Z"
  },
  {
    "id": 2,
    "caller": "Alice Johnson",
    "callee": "Bob Brown",
    "call_duration": 300,
    "call_date": "2024-09-13T14:00:00.000Z"
  }
]

```
