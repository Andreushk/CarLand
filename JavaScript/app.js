/*
  The application uses a local database, which is a json file. I could use Firebase, 
  but I already have experience with it (see MovieMate project) and I want to practice 
  using the capabilities of Node.js to work with files. Just variety :)
*/

/* ---------------- App ---------------- */
const carLandApp = (function() {

  /* ------- model ------- */
  function Model() {
    this.view = null;
    this.serverParametrs = {
      path: "http://localhost:3000"
    };
  };

  Model.prototype.initialize = function(view) {
    this.view = view;
  };

  Model.prototype.renderPage = function() {
    this.view.renderPage();
  };

  Model.prototype.showListOfCarsInDBInSelect = async function() {
    this.view.openListOfCarsInDBWithLoading();
    const data = await this.getListOfCarsInDB();
    this.view.removeLoader();
    this.view.renderListOfCarsInDBInSelect(data);
  };

  Model.prototype.getListOfCarsInDB = async function() {
    try {
      const response = await fetch(`${this.serverParametrs.path}/requestForListOfAvailableCars`);
      return data = await response.json();
    } catch(e) {
      console.warn(e);
    };
  };

  Model.prototype.closeListOfAvailableCars = function() {
    this.view.closeListOfAvailableCars();
  };

  Model.prototype.getInfoAboutCar = async function(carName) {
    this.view.setCarNameInSelect(carName, "info");
    this.view.cleanInfoSection();
    this.view.makeLoaderInInfoSection();
    
    carName = carName.replace(/ /g, "_");
    try {
      const response = await fetch(`${this.serverParametrs.path}/info=${carName}`);
      const data = await response.json();
      this.view.removeLoader();
      this.view.showInfoAboutCar(carName, data);
    } catch(error) {
      console.warn(error);
    };
  };

  Model.prototype.showModalWindowForDeleteInfo = function() {
    this.view.showModalWindowForDeleteInfo();
  };

  Model.prototype.removeOverflow = function() {
    this.view.removeOverflow();
  };

  Model.prototype.showListOfCarsInDBInRemoveModal = async function() {
    this.view.openListWithLoadingInRemoveModal();
    const data = await this.getListOfCarsInDB();
    this.view.removeLoader();
    this.view.renderListInRemoveModal(data);
  };

  Model.prototype.closeDeleteSelect = function() {
    this.view.closeDeleteSelect();
  };

  Model.prototype.setCarNameInSelectAndActivateButton = function(carName) {
    this.view.setCarNameInSelect(carName, "remove");
    this.view.unlockRemoveButton();
  };

  Model.prototype.deleteCarInfo = function(carName) {
    this.view.removeOverflow();
    this.deleteCarInfoFromDB(carName);
  };

  Model.prototype.deleteCarInfoFromDB = async function(carName) {
    const carInfo = JSON.stringify({"carName": carName});

    try {
      const response = await fetch(`${this.serverParametrs.path}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: carInfo
      });
      const data = await response.json();

      if (data.status !== "200") {
        const error = new Error();
        error.name = "The information is not deleted";
        error.message = "The information is not deleted, try again later...";
        throw error;
      };

    } catch(e) {
      console.warn(e);
    };
  };

  Model.prototype.showModalWindowForAddingInfo = function() {
    this.view.showModalWindowForAddingInfo();
  };

  Model.prototype.addNewCarInDB = async function(data) {
    this.view.removeOverflow();
    
    try {
      const JSONdata = JSON.stringify(data);

      const response = await fetch(`${this.serverParametrs.path}/add`, {
        method: "POST", 
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSONdata
      });
      const answer = await response.json();

      if (answer.status !== "200") {
        const error = new Error();
        error.name = "Information has not been added";
        error.message = "Information has not been added, try again later...";
        throw error;
      };

    } catch(e) {
      console.warn(e);
    }
  };
  /* ----- end model ----- */


  /* -------- view ------- */
  function View() {
    this.elements = {
      select: null,
      selectInRemoveModal: null,
      infoSection: null,
      loading: null,
    }
  };

  View.prototype.renderPage = function() {
    const wrapper = document.getElementById("wrapper");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("content-container");
    wrapper.append(contentContainer);

    const contentSection = document.createElement("div");
    contentSection.classList.add("info-container");
    contentContainer.append(contentSection);
    
    const contentSectionHeader = document.createElement("div");
    contentSectionHeader.classList.add("info-container__header");
    contentSection.append(contentSectionHeader);
    
    const contentSectionTitle = document.createElement("h1");
    contentSectionTitle.textContent = "Select a vehicle:";
    contentSectionHeader.append(contentSectionTitle);
    
    const contentSectionSelect = document.createElement("div");
    contentSectionSelect.classList.add("info-container__select");
    contentSectionHeader.append(contentSectionSelect);
    this.elements.select = contentSectionSelect;
    
    this.elements.infoSection = document.createElement("div");
    this.elements.infoSection.classList.add("info-container__body");
    contentSection.append(this.elements.infoSection);
    
    const contentSectionBodyContainerForMessage = document.createElement("div");
    contentSectionBodyContainerForMessage.classList.add("info-container__message");
    this.elements.infoSection.append(contentSectionBodyContainerForMessage);
    
    const contentSectionBodyMessage = document.createElement("p");
    contentSectionBodyMessage.textContent = "Nothing was selected...";
    contentSectionBodyContainerForMessage.append(contentSectionBodyMessage);

    const controllsContainer = document.createElement("div");
    controllsContainer.classList.add("controlls-container");
    contentContainer.append(controllsContainer);

    const removeCarInfoButton = document.createElement("button");
    removeCarInfoButton.classList.add("controlls-container__remove-btn");
    removeCarInfoButton.setAttribute("type", "button");
    removeCarInfoButton.textContent = "Delete info about car";
    controllsContainer.append(removeCarInfoButton);

    const addCarInfoButton = document.createElement("button");
    addCarInfoButton.classList.add("controlls-container__add-btn");
    addCarInfoButton.setAttribute("type", "button");
    addCarInfoButton.textContent = "Add info about car";
    controllsContainer.append(addCarInfoButton);
  };

  View.prototype.openListOfCarsInDBWithLoading = function() {
    this.elements.loading = document.createElement("div");
    this.elements.loading.classList.add("info-container__results-for-search-loading");
    this.elements.select.append(this.elements.loading);
    
    const loader = document.createElement("div");
    loader.classList.add("loader");
    this.elements.loading.append(loader);
  };

  View.prototype.removeLoader = function() {
    this.elements.loading.remove();
  };

  View.prototype.renderListOfCarsInDBInSelect = function(data) {
    const resultsForSearchContainer = document.createElement("div");
    resultsForSearchContainer.classList.add("info-container__results-for-search");
    this.elements.select.append(resultsForSearchContainer);
    
    data.forEach(element => {
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-for-search");
      resultItem.setAttribute("data-car", element);
      resultItem.textContent = element;
      resultsForSearchContainer.append(resultItem);
    });
  };

  View.prototype.closeListOfAvailableCars = function() {
    const list = this.elements.select.querySelector(".info-container__results-for-search");
    list.remove();
  };

  View.prototype.setCarNameInSelect = function(carName, select) {
    if (select === "info") {
      this.elements.select.textContent = carName;
    } else if (select === "remove") {
      this.elements.selectInRemoveModal.textContent = carName;
    };
  };

  View.prototype.cleanInfoSection = function() {
    this.elements.infoSection.innerHTML = "";
  };
    
  View.prototype.makeLoaderInInfoSection = function() {    
    this.elements.loading = document.createElement("div");
    this.elements.loading.classList.add("info-container__info-loading");
    this.elements.infoSection.append(this.elements.loading);
    
    const loader = document.createElement("div");
    loader.classList.add("loader");
    this.elements.loading.append(loader);
  };

  View.prototype.showInfoAboutCar = function(carName, data) {    
    const infoSectionImageContainer = document.createElement("div");
    infoSectionImageContainer.classList.add("info-container__img-container");
    this.elements.infoSection.append(infoSectionImageContainer);
    
    const image = document.createElement("img");
    image.setAttribute("src", data[8].Image);
    infoSectionImageContainer.append(image);
    
    const textInfoContainer = document.createElement("div");
    textInfoContainer.classList.add("info-container__content");
    this.elements.infoSection.append(textInfoContainer);
    
    const carNameparagraph = document.createElement("h1");
    carNameparagraph.textContent = carName.replace(/_/g, " ");
    textInfoContainer.append(carNameparagraph);
    
    for (let i = 0; i < data.length - 1; i++) {
      const dataItem = data[i];
      const dataElements = Object.entries(dataItem)[0];
          
      const characteristicItem = document.createElement("p");
      characteristicItem.textContent = dataElements[1];
    
      const characteristicTitle = document.createElement("span");
      characteristicTitle.textContent = `${dataElements[0]}: `;
    
      characteristicItem.prepend(characteristicTitle);
      textInfoContainer.append(characteristicItem);
    };
  };

  View.prototype.showModalWindowForDeleteInfo = function() {
    const overflow = document.createElement("div");
    overflow.classList.add("overflow");
    overflow.setAttribute("id", "overflow");
    document.body.prepend(overflow);

    const modal = document.createElement("div");
    modal.classList.add("delete-modal");
    overflow.append(modal);

    const modalBody = document.createElement("div");
    modalBody.classList.add("delete-modal__body");
    modal.append(modalBody);

    const modalTitle = document.createElement("h1");
    modalTitle.textContent = "Choose a car to remove";
    modalBody.append(modalTitle);

    this.elements.selectInRemoveModal = document.createElement("div");
    this.elements.selectInRemoveModal.classList.add("delete-modal__select");
    modalBody.append(this.elements.selectInRemoveModal);

    const modalRemoveButton = document.createElement("button");
    modalRemoveButton.classList.add("delete-modal__remove-btn");
    modalRemoveButton.setAttribute("type", "button");
    modalRemoveButton.textContent = "Remove";
    modalRemoveButton.disabled = true;
    modalBody.append(modalRemoveButton);
  };

  View.prototype.removeOverflow = function() {
    document.getElementById("overflow").remove();
  };

  View.prototype.openListWithLoadingInRemoveModal = function() {
    this.elements.loading = document.createElement("div");
    this.elements.loading.classList.add("info-container__results-for-search-loading");
    this.elements.selectInRemoveModal.append(this.elements.loading);
    
    const loader = document.createElement("div");
    loader.classList.add("loader");
    this.elements.loading.append(loader);
  }

  View.prototype.renderListInRemoveModal = function(data) {
    const resultsContainer = document.createElement("div");
    resultsContainer.classList.add("info-container__results-for-search");
    this.elements.selectInRemoveModal.append(resultsContainer);
    
    data.forEach(element => {
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-for-delete");
      resultItem.setAttribute("data-car", element);
      resultItem.textContent = element;
      resultsContainer.append(resultItem);
    });
  };

  View.prototype.closeDeleteSelect = function() {
    const select = this.elements.selectInRemoveModal.querySelector(".info-container__results-for-search");
    select.remove();
  };

  View.prototype.unlockRemoveButton = function() {
    document.getElementsByClassName("delete-modal__remove-btn")[0].disabled = false;
  };

  View.prototype.showModalWindowForAddingInfo = function() {
    const overflow = document.createElement("div");
    overflow.classList.add("overflow");
    overflow.setAttribute("id", "overflow");
    document.body.prepend(overflow);

    const modal = document.createElement("div");
    modal.classList.add("add-modal");
    overflow.append(modal);

    const modalBody = document.createElement("div");
    modalBody.classList.add("add-modal__body");
    modal.append(modalBody);

    const modalTitle = document.createElement("h1");
    modalTitle.textContent = "Adding a new car";
    modalBody.append(modalTitle);

    const HTML = `
    <div class="add-modal__info-container">
            <div>
                <h2>Car name:</h2>
                <input id="carName-input" type="text" placeholder="BMW, Opel, Renault...">
            </div>
            <div>
                <h2>Car image:</h2>
                <input id="car-image-input" type="text" placeholder="URL of image">
            </div>
            <div>
                <h2>Engine capacity:</h2>
                <input id="engine-capacity-input" type="text" placeholder="2.0">
                <p>l.</p>
            </div>
            <div>
                <h2>Power:</h2>
                <input id="power-input" type="text" placeholder="120">
                <p>hp.</p>
            </div>
            <div>
                <h2>Fuel:</h2>
                <input id="fuel-input" type="text" placeholder="RON-95, Deisel, Electric...">
            </div>
            <div>
                <h2>Consumption:</h2>
                <input id="consumption-input" type="text" placeholder="6.7">
                <p>l.</p>
            </div>
            <div>
                <h2>Acceleration:</h2>
                <input id="acceleration-input" type="text" placeholder="6.9">
                <p>s.</p>
            </div>
            <div>
                <h2>Transmission:</h2>
                <select name="transmission" id="transmission-select">
                    <option>Manual Transmission</option>
                    <option>Torque Converter Transmission</option>
                    <option>Continuously Variable Transmission</option>
                    <option>Dual-Clutch Transmission</option>
                    <option>Tiptronic Transmission</option>
                </select>
            </div>
            <div>
                <h2>Engine type:</h2>
                <select name="engine-type" id="engine-type-select">
                    <option>Gasoline</option>
                    <option>Diesel</option>
                    <option>Natural Gas</option>
                    <option>Propane Engine</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                    <option>Jet</option>
                </select>
            </div>
            <div>
                <h2>Drive type:</h2>
                <select name="drive-type" id="drive-select">
                    <option>front</option>
                    <option>rear</option>
                    <option>4WD</option>
                    <option>part-time 4WD</option>
                </select>
            </div>
        </div>`;
    
    modalBody.innerHTML += HTML;

    const addCarInfoButton = document.createElement("button");
    addCarInfoButton.classList.add("add-modal__add-btn");
    addCarInfoButton.setAttribute("type", "button");
    addCarInfoButton.textContent = "Add";
    modalBody.append(addCarInfoButton);
  };
  /* ------ end view ----- */


  /* ---- controller ----- */
  function Controller() {
    this.model = null;
    this.listenerForClick = null;

    this.isCarsListOpen = false;
  };

  Controller.prototype.initialize = function(model) {
    this.model = model;
  };

  Controller.prototype.startApp = function() {
    this.model.renderPage();
    this.addListener();
  };

  Controller.prototype.addListener = function() {
    this.listenerForClick = this.checkWhatWasClicked.bind(this);
    document.addEventListener("click", this.listenerForClick);
  };
    
  Controller.prototype.checkWhatWasClicked = function(event) {
    event.preventDefault();
    const target = event.target;
    
    if (this.isCarsListOpen) {
      this.isCarsListOpen = false;
      this.model.closeListOfAvailableCars();
    };
    
    if (target.closest(".info-container__select")) {
      this.isCarsListOpen = true;
      this.model.showListOfCarsInDBInSelect();
    };
    
    if (target.closest(".result-for-search")) {
      this.getNameOfTheSelectedCar(target);
      return
    };

    if (target.closest(".controlls-container__remove-btn")) {
      this.model.showModalWindowForDeleteInfo();
      return
    };

    if (target === document.getElementById("overflow")) {
      this.model.removeOverflow();
      return
    };

    if (target.closest(".delete-modal__select") && !target.closest(".result-for-delete")) {
      this.model.showListOfCarsInDBInRemoveModal();
      return
    };

    if (target.closest(".result-for-delete")) {
      this.model.closeDeleteSelect();
      this.model.setCarNameInSelectAndActivateButton(target.getAttribute("data-car"))
      return
    };

    if (target.closest(".delete-modal__remove-btn")) {
      this.getNameOfTheSelectedCarForDelete();
      return
    };

    if (target.closest(".controlls-container__add-btn")) {
      this.model.showModalWindowForAddingInfo();
      return
    };

    if (target.closest(".add-modal__add-btn")) {
      this.getInfoFromInputs();
      return
    };

  };

  Controller.prototype.getNameOfTheSelectedCar = function(target) {
    const carName = target.getAttribute("data-car");
    this.model.getInfoAboutCar(carName);
  };

  Controller.prototype.getNameOfTheSelectedCarForDelete = function() {
    const carName = document.querySelector(".delete-modal__select").textContent;
    this.model.deleteCarInfo(carName);
  };

  Controller.prototype.getInfoFromInputs = function() {
    const carName = document.getElementById("carName-input").value.trim();
    const carImage = document.getElementById("car-image-input").value.trim();
    const engineCapacity = document.getElementById("engine-capacity-input").value.trim();
    const power = document.getElementById("power-input").value.trim();
    const fuel = document.getElementById("fuel-input").value.trim();
    const consumption = document.getElementById("consumption-input").value.trim();
    const acceleration = document.getElementById("acceleration-input").value.trim();
    const transmission = document.getElementById("transmission-select").value;
    const engineType = document.getElementById("engine-type-select").value;
    const driveType = document.getElementById("drive-select").value;

    if (carName && carImage && engineCapacity && power && fuel && consumption && acceleration && transmission && engineType && driveType) {
      const data = {
        carName: carName,
        carImage: carImage,
        engineCapacity: engineCapacity,
        power: power,
        fuel: fuel,
        consumption: consumption,
        acceleration: acceleration,
        transmission: transmission,
        engineType: engineType,
        driveType: driveType
      };

      this.model.addNewCarInDB(data);
    } else {
      return;
    };
  };
  /* -- end controller --- */


  return {
    initialize: function() {
      // creating MVC
      const model = new Model();
      const view = new View();
      const controller = new Controller(); 

      // initialize MVC
      model.initialize(view);
      controller.initialize(model);

      controller.startApp();
    }
  }

}());

document.addEventListener("DOMContentLoaded", () => {
  carLandApp.initialize();
});