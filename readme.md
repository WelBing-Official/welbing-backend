# Welbing Waitlist Server

This is the server for handling http requests from the welbing waitlist page

# Usage

This server listens for **GET** and **POST** requests

# GET Requests

Get requests made to this server are for test purpose. This is to test the connection to the server

The response from the server to a **GET** request from an allowed origin is as such below

```JSON
{
    "resolved" : true,
    "message" : "hello world"
}
```

# POST Requests

**POST** requests made to this server should only send data which is in **JSON** format and the structure of the **JSON** data should be as the one below

```JSON
{
  "name":"full name",
  "email": "user@exampe.com",
  "category": "basic" || "practitioner" || "hospital"
}
```
The **category** property's value should be one of those above

# POST Requests Responses

## If the request data does not match the format specified above

```JSON
{
    "resolved" : false,
    "message" : "Input error"
}
```

## If there is an error with parsing the request data

```JSON
{
    "resolved" : false,
    "message" : "Error while parsing data, ...additional error message"
}
```

## If there is an issue with recording the data on the database or reading the database

```JSON
{
    "resolved" : false,
    "message" : `Server error`
}
```

## If the data already exists on the database

```JSON
{
    "resolved" : false,
    "message" : "Already joined before"
}
```

## If the data is successfully appeded to the database

```JSON
{
    "resolved" : true,
    "message" : "Has joined successfully"
}
```

made with 💖 by [Udezue Oluomachi Chimaobi](https://github.com/udezueoluomachi)