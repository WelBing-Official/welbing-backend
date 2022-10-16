<div style="width:max-content; margin:auto;">
    <img src="./logo.jpg" alt="Welbing Logo" style="height:300px;">
</div>

# Welbing Waitlist Server

This is the server for handling http requests from the welbing waitlist page

# Usage & Endpoint

URL : [https://welbing-waitlist.herokuapp.com/](https://welbing-waitlist.herokuapp.com/)

This server listens for **GET** and **POST** requests on the endpoint "/"

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
  "category": "basic practitioner hospital"
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
    "message" : "Server error"
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

# Report posting

```JSON
{
  "patient_tracking_id" : "wp7rn7los96gidkn60nnz",
  "doctor_name" : "John Doe",
  "medical_report" : "Patient is a 38-year-old female with a history of hypertension and obesity. She has been treated for both conditions with medication for the past 5 years. She has also been diagnosed with type 2 diabetes mellitus 3 years ago and is currently being treated with insulin injections and oral medication. She has no known allergies and has never been hospitalized.", 
  "optional_tag" : "",
  "hospital_tracking_id" : "0iyzfs9lp8hbd5yguf14l"
}
```

# Register

```JSON
{
  "name" : "Udezue OLuomachi Chimaobi",
  "email" : "basilchimaobi2@gmail.com",
  "password" : "jfbejibyhrbguirbg",
  "category" : "basic"
}
```

# Login

```JSON
{
  "email" : "basilchimaobi2@gmail.com",
  "password" : "jfbejibyhrbguirbg",
  "category" : "basic"
}
```

# Search

```JSON
{
  "name" : "Oluomachi"
}
```

# Post Tag

```JSON
{
  "patient_tracking_id" : "dydn3rsebukoc7nzo2bru",
  "doctor_name" : "John Doe",
  "reason" : "Patient is a 38-year-old female with a history of hypertension and obesity. She has been treated for both conditions with medication for the past 5 years. She has also been diagnosed with type 2 diabetes mellitus 3 years ago and is currently being treated with insulin injections and oral medication. She has no known allergies and has never been hospitalized.", 
  "tag_name" : "Diabetes patient",
  "hospital_tracking_id" : "0iyzfs9lp8hbd5yguf14l"
}
```

# Profile Edit / Setup

```JSON
{
    "name": "Udezue OLuomachi Chimaobi",
    "tracking_id": "hve6695crqizsusx1x7hs",
    "profile": {
        "gender": "",
        "date_of_birth": "",
        "address": "",
        "occupation": "",
        "contact_information": "",
        "emergency_contact_information": "",
        "Nationality": "",
        "state_of_origin": "",
        "genotype": "",
        "blood_type": "",
        "genetic_disease": "",
        "Allergies": "",
        "physical_challenge": "",
        "weight": {
            "value": "",
            "time": ""
        }
    }
}
```

# Note

Not much security features have been implemented
This readme file is disorganised because of limited time

made with 💖 by [Udezue Oluomachi Chimaobi](https://github.com/udezueoluomachi)