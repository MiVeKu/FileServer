# File server

[Description](https://github.com/MiVeKu/FileServer#description)  |  [Install](https://github.com/MiVeKu/FileServer#install)  |  [Overview](https://github.com/MiVeKu/FileServer#Overview)

## Description

### File server is a basic web application for uploading files to MongoDB database for storage and listing uploaded files in the database. Currently the app can stream back image files for viewing. The applications interface is in Finnish.

File server uses:
* MonogoDB, a NoSQL database used to store data
* Express.js, a web application framework that runs on Node.js
* GridFS, a specification for storing and retrieving files that exceed the BSON-document size limit. [GridFS documentation] (https://docs.mongodb.com/manual/core/gridfs/)
* Pug,  template engine for Node.js. [Pug Github page](https://github.com/pugjs/pug)
* Node.js, an execution environment for event-driven server-side and networking applications.


## Install

### 1. Install Node.js. 
   Download Node.js in [here](https://nodejs.org/en/download/). LTS version recommended.
### 2. Install MongoDB
   Download MongoDB in [here](https://www.mongodb.com/download-center/community). MongoDB can be installed using complete install with default settings.
### 3. Clone or download this repository
   If you download this repository as a ZIP file file unzip it before continuing.
### 4. Move into the project folder using command line
   Open command line and use command **cd C:\Example\Folder\nodejs-harjoitusTYöCop\** to move to the project folder.
### 5. Install dependencies
   This is done using a command **npm install**.
### 6. Start the server
   With the command **node app**
   
   Now the file server can be accessed with a internet browser in **localhost:3000**


## Overview

### Main views
The application has two main views, the list view:

![alt text](https://github.com/MiVeKu/FileServer/blob/master/images/lisviewnew.png "The list view")

and the uploading view:

![alt text](https://github.com/MiVeKu/FileServer/blob/master/images/uploadview.png "The uploading view")
### List view
Here you can see a simple list of the files currently in the database. The files are ordered by adding date. For every file, file type is listed and links for viewing (if the file is an image) and deleting form the database are provided. The last item in the list is a link to the uploading view. If there are no files in the database an error message is shown. In this case you can go straight to the uploading view by typing http://localhost:3000/addImg to the address bar.
### Uploading files
In the uploading view files can be uploaded with the provided file manager instance.

![alt text](https://github.com/MiVeKu/FileServer/blob/master/images/uploadfileman.png "The uploading view")

the uploaded file is then added to the the list in list view.

![alt text](https://github.com/MiVeKu/FileServer/blob/master/images/listview.png "The list view")

