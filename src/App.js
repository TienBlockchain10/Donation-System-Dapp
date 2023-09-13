import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/DonationSystem.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSystemOwner, setisSystemOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", donate: "", SystemName: "" });
  const [systemOwnerAddress, setsystemOwnerAddress] = useState(null);
  const [donorTotalBalance, setdonorTotalBalance] = useState(null);
  const [currentSystemName, setcurrentSystemName] = useState(null);
  const [donorAddress, setdonorAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xD8a493908Dd187C26d6C8Ed9A25815c0cD507DdF';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setdonorAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our donation system.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getSystemName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        let SystemName = await DonationSystem.SystemName();
        SystemName = utils.parseBytes32String(SystemName);
        setcurrentSystemName(SystemName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setSystemNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await DonationSystem.setSystemName(utils.formatBytes32String(inputValue.SystemName));
        console.log("Setting System Name...");
        await txn.wait();
        console.log("System Name Changed", txn.hash);
        await getSystemName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getSystemOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await DonationSystem.SystemOwner();
        setsystemOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setisSystemOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  



  const donorBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await DonationSystem.getdonorBalances();
        setdonorTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const donateMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await DonationSystem.donateMoney({ value: ethers.utils.parseEther(inputValue.donate) });
        console.log("donating money...");
        await txn.wait();
        console.log("donated money...done", txn.hash);

        donorBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withdrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await DonationSystem.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        donorBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getSystemName();
    getSystemOwnerHandler();
    donorBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Donation System Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentSystemName === "" && isSystemOwner ?
            <p>"Setup the name of your donation system." </p> :
            <p className="text-3xl font-bold">{currentSystemName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="donate"
              placeholder="0.0000 ETH"
              value={inputValue.donate}
            />
            <button
              className="btn-purple"
              onClick={donateMoneyHandler}>donate Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withdrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{donorTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">System Owner Address: </span>{systemOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{donorAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isSystemOwner && (
          <section className="system-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">System Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="SystemName"
                  placeholder="Enter a Name for Your Donation System"
                  value={inputValue.SystemName}
                />
                <button
                  className="btn-grey"
                  onClick={setSystemNameHandler}>
                  Set Donation System Name
                </button>
              </form>
            </div>
          </section>
        )

        
      }
    </main>
  );
}
export default App;