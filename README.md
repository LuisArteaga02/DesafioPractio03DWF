<h2>User service Gestion App in SpringBoot</h2>
<img width="500" height="500" alt="reimu0000 " src="https://github.com/LuisArteaga02/DesafioPractio02DWF/blob/main/spring-boot-1.svg">
App what manage with api crud and MVC distint type of suscriptions and users what have errors manage and OpenAPI/Swagger for manage data of users and suscriptions with frontend

<h3>How To Run</h3>
bash git clone https://github.com/LuisArteaga02/DesafioPractio02DWF.git cd DesafioPractico02DWF

Run the project in inteliji IDEA or type mvn spring-boot:run in terminal

then in your browser go to http://localhost:8080/swagger-ui for display swager endpoints, users and suscriptions is located in /api/users and /api/suscriptions ./data directory

If you want to see the frontend just type http://localhost:8080/ and you can see a login page and a registration 

<h3>Examples of endpoints</h3>
Subscription:
{
    "id": 1,<br>
    "type": "Netflix", <br>
    "startDate": "2025-09-23", <br>
    "endDate": "2025-09-29",<br>
    "user": {<br>
      "id": 1,<br>
      "name": "Juanito", <br>
      "email": "juanito@email.com",<br>
      "createdAt": "2025-09-22T17:27:53.037759"<br>
    },<br>
    "active": false,<br>
    "valid": true<br>
  }<br>
  User:<br>
    {<br>
        "id": 1,<br>
        "name": "Juanito",<br>
        "email": "juanito@email.com",<br>
        "createdAt": "2025-09-22T17:27:53.037759"<br>
    }<br>
<h3>Authors</h3>
 Ever Gabriel Cabezas Alfaro,
Luis Enrique Cartagena Arteaga
  

