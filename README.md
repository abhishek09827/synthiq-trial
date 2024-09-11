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
