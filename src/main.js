import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import charityAbi from "../contract/charity.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const CHARITY_CONTRACT_ADDRESS = "0xe1CE07F05cCb47eC5dD6b11a14B47371fECfaA08"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let proposals = []

// Wallet connection with celo wallet
const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(charityAbi, CHARITY_CONTRACT_ADDRESS)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

// cUSD contract approval process
async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(CHARITY_CONTRACT_ADDRESS, _price)
    .send({ from: kit.defaultAccount })
  return result
}

// Gets the user balance
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  console.log('totalBalance::::', cUSDBalance)
  document.querySelector("#balance").textContent = cUSDBalance
}

// Retrieve all the proposal & details from charity contract and display in UI
const getProposals = async function() {
  const _proposalsLength = await contract.methods.getTotalProposals().call();
  const _proposals = []
  for (let i = 0; i < _proposalsLength; i++) {
    let _proposal = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProposal(i).call()
      resolve({
        index: i,
        name: p[0],        
        description: p[1],
        image: p[2],
        owner: p[3],
        status: p[4],
        amount: new BigNumber(p[5]),
        trackAmount: new BigNumber(p[6]),
      })
    })
    _proposals.push(_proposal)
  }
  proposals = await Promise.all(_proposals)
  renderProposals()
}

// HTML template for proposal
function renderProposals() {
  document.getElementById("charity").innerHTML = "";
  // To remove deleted proposals
  let availableProposals = proposals.filter((item) => item.owner != "0x0000000000000000000000000000000000000000");
  availableProposals.forEach((_proposal) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = proposalTemplate(_proposal)
    document.getElementById("charity").appendChild(newDiv)
  })
}


/* Added below function to Individual proposal templates:
* 1. Edit modal - Can modify or deactivate the propsal.
* 2. Cancel/Terminate proposal.
* 3. Donation methods for Contributors.
*/
function proposalTemplate(_proposal) {

  console.log('toFixed::::::::::', )
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_proposal.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        $ ${_proposal.trackAmount.shiftedBy(-ERC20_DECIMALS).toFixed(2)} Raised
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_proposal.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_proposal.name}</h2>
        <p class="card-text mb-4" style="min-height: 50px">
          ${_proposal.description}             
        </p>
        <p class="card-text mt-4">
          <span>Status: ${_proposal.status ? "Active" : "Inactive"}</span>
        </p>
        <p class="card-text mt-4">
          To be Raised: ${_proposal.amount.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
        </p>
        ${_proposal.owner.toLowerCase() == kit.defaultAccount.toLowerCase() ? `<div class="d-grid gap-2">
          <a
            class="btn btn-lg btn-outline-primary editBtn rounded-pill fs-6 p-3" 
            id=${_proposal.index}-edit
            data-bs-toggle="modal"
            data-bs-target="#editModal-${_proposal.index}"
          >
            Edit
          </a>
          <a class="btn btn-lg btn-outline-danger rounded-pill cancelBtn fs-6 p-3" id=cancel-${_proposal.index}>
            Cancel
          </a>
        </div>` : `<div class="d-grid gap-2">
          <p>${(new Number(_proposal.trackAmount.toFixed()) >= new Number(_proposal.amount.toFixed()) || _proposal.status == false) ? "Proposal is Paused/Reached the limit" : ""}</p>
          <input
            type="number"
            id="contribute-${_proposal.index}"
            class="form-control mb-2 rounded-pill"
            placeholder="Enter Amount"
            ${(new Number(_proposal.trackAmount.toFixed()) >= new Number(_proposal.amount.toFixed()) || _proposal.status == false)? "disabled" : " "}
          />
          <a class="btn btn-lg btn-outline-success rounded-pill donateBtn fs-6 p-3" id=donate-${_proposal.index}>
            Donate
          </a>
        </div>
        `}
      </div>
    </div>
    
    <!--Modal-->
    <div
    class="modal fade"
    id="editModal-${_proposal.index}"
    tabindex="-1"
    aria-labelledby="editProductModalLabel"
    aria-hidden="true"
    >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editProductModalLabel">Edit Proposal</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-row">
              <div class="col">
                <input
                  type="text"
                  id="editProposalName-${_proposal.index}"
                  class="form-control mb-2"
                  placeholder="Edit name of proposal"
                  value="${_proposal.name}"
                />
              </div>
              <div class="col">
                <input
                  type="text"
                  id="editImgUrl-${_proposal.index}"
                  class="form-control mb-2"
                  placeholder="Edit image url"
                  value="${_proposal.image}"
                />
              </div>
              <div class="col">
                <input
                  type="text"
                  id="editProposalDescription-${_proposal.index}"
                  class="form-control mb-2"
                  placeholder="Edit proposal description"
                  value="${_proposal.description}"
                />
              </div>
              <div class="col">
                <input
                  type="number"
                  id="editAmount-${_proposal.index}"
                  class="form-control mb-2"
                  placeholder="Edit Amount"
                  value=${_proposal.amount.shiftedBy(-ERC20_DECIMALS).toFixed(2)}
                />
              </div>
              <div class="col">
                <span>Active</span>
                <input
                  type="checkbox"
                  id="editStatus-${_proposal.index}"
                  ${_proposal.status ? "checked" : " "}
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-light border"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button
            type="button"
            class="btn btn-primary saveProposalBtn"
            data-bs-dismiss="modal"
            id="saveProposalBtn-${_proposal.index}"
          >
            Save
          </button>
        </div>
      </div>
    </div>
    </div>
    <!--/Modal-->
  `
}


function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProposals()
  notificationOff()
});

// Proposal creation method: Get the proposal details and save to contract
document
  .querySelector("#newProposalBtn")
  .addEventListener("click", async () => {
    const params = [
      document.getElementById("newProposalName").value,
      document.getElementById("newProposalDescription").value,
      document.getElementById("newImgUrl").value,
      new BigNumber(document.getElementById("newAmount").value).shiftedBy(ERC20_DECIMALS).toFixed(),
    ]
    console.log('params::::', params)
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .createProposal(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProposals()
    setTimeout(notificationOff, 5000);
  })

// Donation module: Contributors will be able to access this module for donating funds
document.querySelector("#charity").addEventListener("click", async (e) => {
  if (e.target.className.includes("donateBtn")) {
    let indexSplit = (e.target.id).split('-');
    const index = indexSplit[1];
    let val = document.getElementById(`contribute-${index}`).value;
    if(val >= 0.01) {
      const amountVal = new BigNumber(val).shiftedBy(ERC20_DECIMALS).toString();
      const name = document.getElementById("editProposalName-" + index).value;
      notification("⌛ Waiting for payment approval...")
      try {
        await approve(amountVal);
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`⌛ Awaiting payment for "${name}"...`)
      try {
        const result = await contract.methods
          .donateProposal(index, amountVal)
          .send({ from: kit.defaultAccount })
        notification(`🎉 You successfully donated "${val}" to "${name}".`)
        getProposals()
        getBalance()
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    } else {
      notification(`⚠️ Donation amount should be greater than 0.01 cUSD.`)
    }
    setTimeout(notificationOff, 5000);
  }
})  

// Edit & Save: Modified proposal will be save to the contract
document.querySelector("#charity").addEventListener("click", async (e) => {
  console.log('e::::', e);
  if (e.target.className.includes("saveProposalBtn")) {
    let indexSplit = (e.target.id).split('-');
    const index = indexSplit[1];
    console.log('index::::', index, document.getElementById("editStatus-" + index).checked);
    const params = [
      index,
      document.getElementById("editProposalName-" + index).value,
      document.getElementById("editProposalDescription-" + index).value,
      document.getElementById("editImgUrl-" + index).value,
      new BigNumber(document.getElementById("editAmount-" + index).value).shiftedBy(ERC20_DECIMALS).toFixed(),
      (document.getElementById("editStatus-" + index).checked == true) ? true : false,
    ]
    console.log('param:::', params)
    notification(`⌛ Editing Proposal "${params[1]}"...`)
    try {
      const result = await contract.methods
        .editProposal(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully updated the "${params[1]}".`)
    getProposals()
    setTimeout(notificationOff, 5000);
  }
})

// Cancel: Termination of the proposal
document.querySelector("#charity").addEventListener("click", async (e) => {
  if (e.target.className.includes("cancelBtn")) {
    let indexSplit = (e.target.id).split('-');
    const index = indexSplit[1];
    console.log('index::::', index);
    const name = document.getElementById("editProposalName-" + index).value;
    notification(`⌛ Deleting Proposal "${name}"...`)
    try {
      const result = await contract.methods
        .cancelProposal(index)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully deleted the "${name}".`)
    getProposals()
    setTimeout(notificationOff, 5000);
  }
})

