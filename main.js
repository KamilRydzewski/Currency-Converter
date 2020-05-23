// const endpoint = "http://data.fixer.io/api/latest?access_key=63bf9685968808c6ecdc616d73c6e2f6";
// You can use this API just on http because https is not supported for free subscription plan.
//  "All paid subscription plans available on Fixer.io come with 256-bit SSL encryption.
//  To connect to the API via SSL, simply use the https protocol instead of standard http.""

const endpoint = "https://api.exchangeratesapi.io/latest";

const form = document.querySelector("form");
const inputDropdowns = document.querySelectorAll(".selected");
const currencyListItems = document.querySelectorAll(".currency-type");
const switchButton = document.getElementById("switch-button");
const inputAmount = document.getElementById("amount");

fetch(endpoint)
  .then((response) => response.json())
  .then((currency) => createDropdownList(Object.keys(currency.rates)));

function createDropdownList(itemsList) {
  const dropdownList = document.querySelectorAll(".currency-list");

  dropdownList.forEach(
    (list) => (list.innerHTML = itemsList.map((currency) => createDropdownItem(currency)).join(""))
  );
}

function createDropdownItem(item) {
  return `
      <li class="currency-list-item" data-key=${item}>
          <span 
          onClick="setCurrency(event)" 
          data-value="${item}" " 
          class="currency-type">
          ${item}
          </span>
      </li>
      `;
}

function toggleDropdown(e) {
  closeAnyOpenDropdowns(e);
  e.target.classList.toggle("active");

  if (e.target.classList.contains("active")) {
    showDropdownList();
  } else {
    hideDropdownList();
  }
}

function showDropdownList() {
  const dropdownContainer = document.querySelectorAll(".currency-list");

  dropdownContainer.forEach((list) => {
    const activeInput = document.querySelector(".selected.active");

    if (activeInput.id === list.dataset.key) {
      list.classList.add("active");
    }
  });
}

function hideDropdownList() {
  const activeList = document.querySelector(".currency-list.active");
  activeList.classList.remove("active");
}

function closeAnyOpenDropdowns(e) {
  const activeDropdown = document.querySelector(".selected.active");

  if (e.target !== activeDropdown && activeDropdown) {
    activeDropdown.classList.remove("active");
    hideDropdownList();
  }
}

function checkActiveDropdown() {
  const activeDropdown = document.querySelector(".selected.active");

  return activeDropdown.id;
}

function setCurrency(e) {
  const selectedInput = document.getElementById(`${checkActiveDropdown()}`);
  const newValue = e.target.dataset.value;

  selectedInput.value = newValue;
}

function getResults(e) {
  e.preventDefault();
  const amount = document.getElementById("amount").value;
  const fromCurrency = document.getElementById("from").value;
  const toCurrency = document.getElementById("to").value;
  const currencyArray = [fromCurrency, toCurrency];

  fetch(endpoint)
    .then((response) => response.json())
    .then((currency) => {
      const currentRates = Object.keys(currency.rates)
        .filter((key) => currencyArray.includes(key))
        .reduce((obj, key) => {
          obj[key] = currency.rates[key];
          return obj;
        }, {});

      const results = ((currentRates[toCurrency] / currentRates[fromCurrency]) * amount).toFixed(6);

      displayResults(amount, fromCurrency, toCurrency, results);
    });
}

function displayResults(amount, haveCurrency, wantedCurrency, results) {
  const container = document.querySelector(".converter-form-results");
  const singleFromValue = (amount / results).toFixed(3);
  const singleToValue = (results / amount).toFixed(3);

  container.innerHTML = `
    <div class="results-container">
        <p>
            <span class="big">${amount}</span> 
            ${haveCurrency} 
            <span class="big"> = </span>
            <span class="big">${results}</span>
            ${wantedCurrency}
        </p>
        <p>
            1 ${haveCurrency} = 
            ${singleToValue} 
            ${wantedCurrency}</p>
        <p>
            1 ${wantedCurrency} = 
            ${singleFromValue} 
            ${haveCurrency}</p>
    </div>
  `;
}

function switchCurrency(e) {
  e.preventDefault();
  const inputFrom = document.getElementById("from");
  const inputTo = document.getElementById("to");
  const inputFromValue = inputFrom.value;

  inputFrom.value = inputTo.value;
  inputTo.value = inputFromValue;
}

function filterList() {
  const itemsList = document.querySelectorAll(".currency-list.active > .currency-list-item");
  const activeInput = document.querySelector(".selected.active");

  if (!activeInput) return;
  const wordToMatch = activeInput.value.toUpperCase();

  itemsList.forEach((item) => {
    const itemKey = item.dataset.key.toUpperCase();

    if (!itemKey.match(wordToMatch)) {
      item.style.display = "none";
    } else {
      item.style.display = "block";
    }
  });
}

function clearInput(e) {
  e.target.value = "";
}

function checkDropdownInput(e) {
  const itemsList = document.querySelectorAll(".currency-list.active > .currency-list-item");
  const wordToMatch = e.target.value.toUpperCase();

  itemsList.forEach((item) => {
    const itemKey = item.dataset.key.toUpperCase();

    if (!itemKey.match(wordToMatch)) {
      item.style.display = "none";
      e.target.value = "";
    }
  });
}

function checkAmountValue(e) {
  const valueToMatch = new RegExp("^[0-9]+$");
  if (!e.target.value.match(valueToMatch)) {
    e.target.value = 1;
  }
}

inputDropdowns.forEach((input) =>
  input.addEventListener("click", (e) => {
    toggleDropdown(e);
    filterList();
  })
);

inputDropdowns.forEach((input) => input.addEventListener("keyup", () => filterList()));
inputDropdowns.forEach((input) => input.addEventListener("focus", (e) => clearInput(e)));
inputDropdowns.forEach((input) => input.addEventListener("focusout", (e) => checkDropdownInput(e)));
switchButton.addEventListener("click", (e) => switchCurrency(e));
window.addEventListener("click", (e) => closeAnyOpenDropdowns(e));
form.addEventListener("submit", (e) => getResults(e));
inputAmount.addEventListener("focusout", (e) => checkAmountValue(e));
