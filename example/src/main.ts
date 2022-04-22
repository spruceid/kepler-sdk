import { Kepler, OrbitConnection, WalletProvider } from "kepler-sdk";
import { providers } from "ethers";

let wallet: WalletProvider;
let connectWalletBtn = document.getElementById(
  "connectWalletBtn"
) as HTMLButtonElement;

connectWalletBtn.onclick = async () => {
  let provider = new providers.Web3Provider(
    // @ts-ignore
    window.ethereum
  );
  await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
  wallet = provider.getSigner();
  connectWalletBtn.innerText = await wallet.getAddress();
  connectWalletBtn.disabled = true;
  loadOrbit.classList.remove("hidden");
};

let kepler: Kepler;
let orbitConnection: OrbitConnection;
let loadOrbit = document.getElementById("loadOrbit") as HTMLDivElement;
let loadOrbitBtn = document.getElementById("loadOrbitBtn") as HTMLButtonElement;

loadOrbitBtn.onclick = async () => {
  kepler = new Kepler(wallet, { hosts: ["http://localhost:8000"] });
  orbitConnection = await kepler.orbit();
  loadOrbitBtn.innerText = orbitConnection.id();
  loadOrbitBtn.disabled = true;
  actions.classList.remove("hidden");
  console.log(putKey.width);
};

let actions = document.getElementById("actions") as HTMLDivElement;

let putBtn = document.getElementById("putBtn") as HTMLButtonElement;
let putKey = document.getElementById("putKey") as HTMLInputElement;
let putValue = document.getElementById("putValue") as HTMLInputElement;
let putResult = document.getElementById("putResult") as HTMLElement;

putBtn.onclick = async () => {
  let key = putKey.value;
  let value = putValue.value;
  putValue.value = "";
  let { ok, statusText } = await orbitConnection.put(key, value );
  putResult.style.color = ok ? "green" : "red";
  putResult.innerHTML = statusText;
};

let getBtn = document.getElementById("getBtn") as HTMLButtonElement;
let getKey = document.getElementById("getKey") as HTMLInputElement;
let getValue = document.getElementById("getValue") as HTMLElement;
let getResult = document.getElementById("getResult") as HTMLElement;

getBtn.onclick = async () => {
  let key = getKey.value;
  let { ok, statusText, data } = await orbitConnection.get(key);
  getResult.style.color = ok ? "green" : "red";
  getResult.innerHTML = statusText;
  getValue.innerHTML = ok ? data : "";
};

let listBtn = document.getElementById("listBtn") as HTMLButtonElement;
let listValue = document.getElementById("listValue") as HTMLTextAreaElement;
let listResult = document.getElementById("listResult") as HTMLElement;

listBtn.onclick = async () => {
  let { ok, statusText, data } = await orbitConnection.list();
  listResult.style.color = ok ? "green" : "red";
  listResult.innerHTML = statusText;
  listValue.innerText = ok ? JSON.stringify(data, null, 4) : "";
};

let deleteBtn = document.getElementById("deleteBtn") as HTMLButtonElement;
let deleteKey = document.getElementById("deleteKey") as HTMLInputElement;
let deleteResult = document.getElementById("deleteResult") as HTMLElement;

deleteBtn.onclick = async () => {
  let key = deleteKey.value;
  let { ok, statusText } = await orbitConnection.delete(key);
  deleteResult.style.color = ok ? "green" : "red";
  deleteResult.innerHTML = statusText;
};
