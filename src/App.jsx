import React, { Component } from "react";
import {ethers} from "ethers";
import "./App.css";
import BigNumber from "bignumber.js";
import axios from 'axios';



let provider ;

class App extends Component {
  state = {
    value: "",
    storageValue: 0,
    temperature: "",
    provider:null
  };

  componentDidMount = async () => {
    try {
      provider  = new ethers.providers.Web3Provider(window.ethereum)
      this.setState({ provider: provider });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  handleChange = async (event) => {
    console.log("handleChange:" + event.target.value)
    this.setState({value: event.target.value});
  };

 
  handleSubmit = async (event) => {
    event.preventDefault();
    console.log("===handleSubmit====");
    console.log(this.state.value);

    let city = "shanghai";
    if (this.state.value !== null || this.state.value !== undefined || this.state.value !== '') { 
      city = this.state.value
    }  

    console.log("this city is :" + city);


    const contractAddress = '0x49354813d8BFCa86f778DfF4120ad80E4D96D74E'
    const abi =   [{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"}],"name":"getWeather","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"},{"internalType":"uint32","name":"temperature","type":"uint32"}],"name":"reportWeather","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    let signer = provider.getSigner()
    const Contract = new ethers.Contract(contractAddress, abi, signer);
  
    let unixData = Date.parse(new Date()) / 10000;
    let batchId = parseInt(unixData)

    let bytes32Key = ethers.utils.formatBytes32String("shanghai");

    let url ='https://goweather.herokuapp.com/weather/'+ city;


    let temperature = "";


     await axios.get(url).then((response)=> {
                console.log(response.data.temperature);
                temperature = response.data.temperature;
            }).catch(function (error) {
                console.log(error);
            });
     
     console.log(city + " temperature is : " + temperature)     

    if(temperature == ""){
      alert(city+" temperature data query is empty")
      return
    }

    let temperatureData =  temperature.replace("+","").replace("-","").split(" ")[0];

    const reportData = parseInt(temperatureData)

     const createReceipt =  await Contract.reportWeather(batchId,bytes32Key,reportData);

     await createReceipt.wait();

     console.log('Tx successful with hash: ${createReceipt.hash}');

    const response = await Contract.getWeather(batchId,bytes32Key);

    console.log("response：" + response);
    this.setState({ storageValue: response.toString() });

  };



  render() {

    return (
      <div className="App">
    
        <p>weather forecast like  shanghai , hongkong , london</p>

        <div>{this.state.value} weather record is: {this.state.storageValue}</div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Need get city weather record:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default App;
