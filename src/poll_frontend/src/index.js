import { poll_motoCoin } from "../../declarations/poll_motoCoin";

var tokenInfo = document.querySelector("#tokenInfo");
var identityInfo = document.querySelector("#identityInfo");
var btnLogin = document.querySelector("#btnLogin");
var btnSendCoins = document.querySelector("#sendCoins");
var btnRandom = document.querySelector("#random");
var btnRefresh = document.querySelector("#refresh");
var blockLogin = document.querySelector('#blockLogin');
var blockTrans = document.querySelector('#blockTrans');
var blockShow = document.querySelector('#blockShow');
var userName = document.getElementById("#userName");
var pID = document.getElementById("#principalID");
var amount = document.getElementById("#amount");
var toID = document.getElementById("#toID");

document.querySelector("#formLogin").addEventListener("submit", async (e) => {
  try{
  e.preventDefault();
  
  var username = userName.value;
  const principalID = pID.value;

  if(principalID==""){
    document.getElementById("loginMsg").innerText = "Please insert your Principal ID, used in MBC May 2023";
  }
  else{
    document.getElementById("loginMsg").innerText ="";

    if(username==""){
      username = "NoUserName";
     }
     
    btnLogin.setAttribute("disabled", true);
    document.body.style.cursor = "wait";

    const balance = await poll_motoCoin.balanceOf(principalID);

    if(balance.lret){
      const tokenName = await poll_motoCoin.name();
      document.getElementById("tokenName").innerText = "TOKEN NAME: " + tokenName;
      const tokenSymbol = await poll_motoCoin.symbol();
      document.getElementById("tokenSymbol").innerText = "TOKEN SYMBOL: " + tokenSymbol;
      

      blockLogin.setAttribute("hidden","true");

      if(tokenInfo.getAttribute("hidden")=="true"){
        tokenInfo.removeAttribute("hidden");
      }
      else{
        tokenInfo.setAttribute("hidden","true");
      }

      const totalSupply = await poll_motoCoin.totalSupply();
      document.getElementById("totalSupply").innerText = "TOTAL SUPLY: " + totalSupply;

      if(identityInfo.getAttribute("hidden")=="true"){
        identityInfo.removeAttribute("hidden");
      }
      document.getElementById("welcome").innerText = "Welcome " + username;
      document.getElementById("balance").innerText = "Your Balance = " + balance.value + " MotoCoins";
    }
    else{
      document.getElementById("loginMsg").innerText ="Error: " + balance.value;
    }
    btnLogin.removeAttribute("disabled");
    document.body.style.cursor = "default";
  }
}
catch(e){
  document.getElementById("loginMsg").innerText = "Unexpected error:"+e;
}
});

document.querySelector("#formLogout").addEventListener("submit", async (e) => {
  try{
    e.preventDefault();

    tokenInfo.setAttribute("hidden","true");
    identityInfo.setAttribute("hidden","true");
    blockTrans.setAttribute("hidden","true");
    blockShow.setAttribute("hidden","true");
    userName.value = "";
    pID.value = "";
    toID.value = "";
    amount.value = "";
    document.getElementById("loginMsg").innerText ="";
    document.getElementById("logTrans").innerText = "";
    document.getElementById("logRefresh").innerText = "";
    document.getElementById("balance").innerText = "";
    document.getElementById("sent").innerText = "";
    blockLogin.removeAttribute("hidden");

  }
  catch(e){
    document.getElementById("loginMsg").innerText = "Unexpected error:"+e;
  }
});

document.querySelector("#formInfo").addEventListener("submit", async (e) => {
  try{
      e.preventDefault();

      if(blockTrans.getAttribute("hidden")=="true"){
        blockTrans.removeAttribute("hidden");
      }
      else{
        blockTrans.setAttribute("hidden","true");
      }
  }
  catch(e){
    document.getElementById("loginMsg").innerText = "Unexpected error: "+e;
  }
});

document.querySelector("#sendCoin").addEventListener("submit", async (e) => {
  try{
      e.preventDefault();

      if(e.submitter.id=="sendCoins"){
        if(amount.value>0){
          document.getElementById("logTrans").innerText = "";
          btnSendCoins.setAttribute("disabled", true);
          document.body.style.cursor = "wait";
          const chk = await poll_motoCoin.transfer(pID.value,toID.value,parseInt(amount.value));
          if(chk.lret==true){
            document.getElementById("logTrans").innerText = amount.value + " MOC sent successfully";
            document.getElementById("balance").innerText = "Your Balance = " + chk.value + " MotoCoins";
            toID.value = "";
            amount.value = "";
          }
          else{
            document.getElementById("logTrans").innerText = "Transfer Error: " + chk.value;
          }
          btnSendCoins.removeAttribute("disabled");
          document.body.style.cursor = "default";
        }
        else{
          document.getElementById("logTrans").innerText = "Amount can't be 0";
        }

      }
      else if(e.submitter.id=="random"){
          document.getElementById("logTrans").innerText = "";
          btnRandom.setAttribute("disabled", true);
          document.body.style.cursor = "wait";
          const chk = await poll_motoCoin.getRandom(parseInt(Math.floor(Math.random() * 6)));
          if(chk.lret==true){
            toID.value = chk.value;
          }
          else{
            document.getElementById("logTrans").innerText = "Random Error: " + chk.value;
          }
          btnRandom.removeAttribute("disabled");
          document.body.style.cursor = "default";
      }
      else{
        if(blockShow.getAttribute("hidden")=="true"){
          blockShow.removeAttribute("hidden");
        }
        else{
          blockShow.setAttribute("hidden","true");
        }
      }
  }
  catch(e){
    btnSendCoins.removeAttribute("disabled");
    document.body.style.cursor = "default";
    document.getElementById("logTrans").innerText = "Unexpected error:"+e;
  }
});

document.querySelector("#showTrans").addEventListener("submit", async (e) => {
  try{
      e.preventDefault();

      document.getElementById("logRefresh").innerText = "";
      btnRefresh.setAttribute("disabled", true);
      document.body.style.cursor = "wait";
      const chk = await poll_motoCoin.getTransaction(pID.value);
      if(chk.lret){
          document.getElementById("sent").innerText = chk.value;
      }
      else{
          document.getElementById("logRefresh").innerText = "Transactions Error: " + chk.value;
      }
      btnRefresh.removeAttribute("disabled");
      document.body.style.cursor = "default";
  }
  catch(e){
    btnRefresh.removeAttribute("disabled");
    document.body.style.cursor = "default";
    document.getElementById("logRefresh").innerText = "Unexpected error: "+e;
  }
});
