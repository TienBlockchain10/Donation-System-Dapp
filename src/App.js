// Import React hooks and ethers for interacting with the Ethereum blockchain
import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
// Import the contract's ABI (Application Binary Interface)
import abi from "./contracts/DonationSystem.json";

function App() {
  // State hooks to manage various states in the app
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSystemOwner, setisSystemOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", donate: "", SystemName: "" });
  const [systemOwnerAddress, setsystemOwnerAddress] = useState(null);
  const [donorTotalBalance, setdonorTotalBalance] = useState(null);
  const [systemTotalBalance, setSystemTotalBalance] = useState(null);
  const [currentSystemName, setcurrentSystemName] = useState(null);
  const [donorAddress, setdonorAddress] = useState(null);
  const [error, setError] = useState(null);
  // Lists to store all donor addresses and their corresponding donation amounts
  const [donorAddresses, setDonorAddresses] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState([]);
 

  // Contract address and ABI for connecting to the smart contract
  const contractAddress = '0xC90D341cbF6c13c00bF72a21fAbab029244EB264';
  const contractABI = abi.abi;

// Function to check if the user's wallet is connected
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
 // Function to get the current system name from the smart contract
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
 // Function to set a new system name
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




  // Function to get the system owner's address
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

  


  // Function to retrieve the total balance donated by the current connected wallet
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



  // Function to retrieve the system's total balance
  const systemBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);
  
        // Add an event listener for the SystemBalanceChanged event
        DonationSystem.on("SystemBalanceChanged", (newBalance) => {
          // Update the system total balance when the event is triggered
          setSystemTotalBalance(utils.formatEther(newBalance));
        });
  
        // Initially fetch and set the system balance
        let balance = await DonationSystem.getSystemBalance();
        setSystemTotalBalance(utils.formatEther(balance));
        console.log("Initial system balance:", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error);
    }
  }
  

// Function to handle the donation action when a user sends Ether
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

  // const withdrawMoneyHandler = async (event) => {
  //   try {
  //     event.preventDefault();
  //     if (window.ethereum) {
  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //       const signer = provider.getSigner();
  //       const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);

  //       let myAddress = await signer.getAddress()
  //       console.log("provider signer...", myAddress);

  //       const txn = await DonationSystem.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
  //       console.log("Withdrawing money...");
  //       await txn.wait();
  //       console.log("Money with drew...done", txn.hash);

  //       donorBalanceHandler();

  //     } else {
  //       console.log("Ethereum object not found, install Metamask.");
  //       setError("Please install a MetaMask wallet to use our donation system.");
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

 // Function to handle the withdrawal of all funds to the owner's wallet
  const systemWithdrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);
  
        const txn = await DonationSystem.withdrawAllToOwner(); // Call the withdrawAllToOwner function
        console.log("Withdrawing all funds to owner...");
        await txn.wait();
        console.log("Funds withdrawn to owner. Transaction hash:", txn.hash);
  
        // Immediately update the system balance after a successful withdrawal
        systemBalanceHandler();
  
        // You may want to update the user interface or perform other actions here
  
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.error("Error while withdrawing funds to owner:", error);
    }
  };
  
  
 // Function to handle changes in the input fields
  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }
// useEffect hook to perform actions on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
    getSystemName();
    getSystemOwnerHandler();
    donorBalanceHandler();
    systemBalanceHandler();
  
    // Fetch donor data
    fetchDonorData();
  }, [isWalletConnected]);
  // Function to fetch all donor addresses and donation amounts
  const fetchDonorData = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const DonationSystem = new ethers.Contract(contractAddress, contractABI, signer);
  
        const addresses = await DonationSystem.getAllDonatedAddresses();
        const amounts = await DonationSystem.getAllDonationAmounts();
  
        setDonorAddresses(addresses);
        setDonationAmounts(amounts);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our donation system.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Check if there is donor data to display
  const hasDonorData = donorAddresses.length > 0 && donorAddresses.length === donationAmounts.length;

  
  return (
 
    <>
   <div className="container">
  

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
        {/* <div className="mt-10 mb-10">
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
        </div> */}
        <div className="mt-5">
          <p><span className="font-bold">Your Total Donations: </span>{donorTotalBalance}</p>
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
              <div className="mt-5">
          <p><span className="text-l px-10 py-4 font-bold">System Balance: </span>{systemTotalBalance}</p>
        </div>

        <div className="p-4">
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
      onClick={setSystemNameHandler}
    >
      Set Donation System Name
    </button>
  </form>
</div>

<div className="p-4"> {/* Add margin-top (mt-2) to the second container */}
  <form className="form-style">
    <input
      type="text"
      className="input-style"
      onChange={handleInputChange}
      name="WithdrawalAmount"
      placeholder="Enter System Withdrawal Amount"
      value={inputValue.WithdrawalAmount}
    />
    <button
      className="btn-grey"
      onClick={systemWithdrawMoneyHandler}
    >
      Withdraw System Balance
    </button>
  </form>
</div>
          </section>
        )
      }

    </main>
   

    
    {hasDonorData && (
      <div className="donor-data-container">
    <h2>Donation Leaderboards</h2>

    <ul>
      {donorAddresses.map((address, index) => (
        <li key={address}>
          <p><span className="font-bold">Address: </span>{address}</p>
          <p><span className="font-bold">Donation Amount: </span>{utils.formatEther(donationAmounts[index])} ETH</p>
        </li>
      ))}
    </ul>
  </div>
    )}

    </div>
    </>
  );

}

export default App;