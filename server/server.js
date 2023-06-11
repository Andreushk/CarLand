const fs = require("fs");
const http = require("http");
const path = require("path");

const server = http.createServer(serverFunc).listen(3000);

function serverFunc(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept");

  if (request.method === "OPTIONS") {
    response.statusCode = 200;
    response.end();
    return;
  };
  
  const requestValue = request.url.slice(1);
  const isRequestMadeOfTwoParts = requestValue.includes("=");

  if (!isRequestMadeOfTwoParts) {
    switch(requestValue) {
      case("requestForListOfAvailableCars"):
        getDataAboutAvailableCars(response);
        break;
      case("remove"):
        startRemoveDataAboutCar(request, response);
        break;
      case("add"):
        startAddingDataAboutCar(request, response);
        break;
      default:
        break;
    };
  };

  if (isRequestMadeOfTwoParts) {
    const partsOfRequest = requestValue.split("=");
    getDataAboutCar(response, partsOfRequest[1]);
  };
}

async function getDataAboutAvailableCars(response) {
  const dataFromDB = fs.readFileSync(path.join(__dirname, "DB", "data.json"), "utf-8");

  const dataObject = JSON.parse(dataFromDB);
  const carsData = dataObject.carsInfo;
  const cars = Object.keys(carsData);

  const dataJSON = JSON.stringify(cars);
  response.setHeader("Content-Type", "application/json");
  response.end(dataJSON);
};

async function getDataAboutCar(response, carName) {
  carName = carName.replace(/_/g, " ");
  
  const dataFromDB = fs.readFileSync(path.join(__dirname, "DB", "data.json"), "utf-8");
  const carsData = JSON.parse(dataFromDB).carsInfo;

  const carData = carsData[carName];
  const carDataJSON = JSON.stringify(carData);
  response.setHeader("Content-Type", "application/json");
  response.end(carDataJSON);
};

async function startRemoveDataAboutCar(request, response) {
  let requestBody = "";

  try {
    request.on("data", chunk => {
      requestBody += chunk;
    });

    request.on("end", () => {
      const car = JSON.parse(requestBody);
      const isDeleted = deleteData(car);

      if (isDeleted) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({"status": "200"}));
      } else {
        const error = new Error();
        error.name = "The information is not deleted";
        error.message = "The information is not deleted, try again later...";
        throw error;
      };
    });

  } catch(e) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({"status": "404"}));
  };
};

async function deleteData(carObject) {
  const car = carObject.carName;

  try {
    const dataJSONForDelete = fs.readFileSync(path.join(__dirname, "DB", "data.json"), "utf-8");
    const carsDataForDelete = JSON.parse(dataJSONForDelete).carsInfo;
    delete carsDataForDelete[car];

    const carsDataForWrite = { carsInfo: carsDataForDelete };
    const dataJSONForWrite = JSON.stringify(carsDataForWrite);
    fs.writeFileSync(path.join(__dirname, "DB", "data.json"), dataJSONForWrite);
    return true;
  } catch (e) {
    return false;
  }
};

async function startAddingDataAboutCar(request, response) {
  let data = "";

  try {

    request.on("data", (chunk) => {
      data += chunk;
    });

    request.on("end", () => {
      const dataObject = JSON.parse(data);
      const isDataAddedToDB = addData(dataObject);

      if (isDataAddedToDB) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({"status": "200"}));
      } else {
        const error = new Error();
        error.name = "Information has not been added";
        error.message = "Information has not been added, try again later...";
        throw error;
      };
    });

  } catch(e) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({"status": "404"}));
  };

};

async function addData(data) {

  try {
    const dataFromDBJSON = fs.readFileSync(path.join(__dirname, "DB", "data.json"), "utf-8");
    const dataFromDB = JSON.parse(dataFromDBJSON).carsInfo;
    dataFromDB[data.carName] = [
      {"Engine capacity": data.engineCapacity + "L"}, 
      {"Power": data.power + "hp"}, 
      {"Transmission": data.transmission}, 
      {"Engine type": data.engineType}, 
      {"Fuel": data.fuel}, 
      {"Drive": data.driveType}, 
      {"Acceleration": data.acceleration + "s"}, 
      {"Consumption": data.consumption + "L"},
      {"Image": data.carImage}
    ];

    const dataForWrite = { carsInfo: dataFromDB };
    const dataJSONForWrite = JSON.stringify(dataForWrite);
    fs.writeFileSync(path.join(__dirname, "DB", "data.json"), dataJSONForWrite);
    return true
  } catch(e) {
    return false
  };

};