const web3 = new Web3(new Web3.providers.HttpProvider("http://116.62.132.128:8545"));

//通过api以及合约地址找到链上合约
const abi = JSON.parse('[{"inputs":[{"internalType":"uint256","name":"tokensAmount","type":"uint256"},{"internalType":"uint256","name":"pricePerToken","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"balanceTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"account","type":"address"}],"name":"getContractEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"addrto","type":"address"},{"internalType":"uint256","name":"number","type":"uint256"}],"name":"giveTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"showContractEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tokensOwned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]')
const contractAddress = '0xEA09e0337157818502a2Ef409A8EF5F471b7f862'

//定义合约对象，用于调用合约方法
var WalletContract = new web3.eth.Contract(abi, contractAddress)

//合约的权限地址
const devAddr = '0x7BB386E6C2ACFbC9F1106aE2B82308DfeC488fe6';
//以太坊权限地址
const initAddr = '0xf565ceD058511d002E3D8bD0Dc6F3E284B895272';

//定义初始用户地址，默认值为0表示用户未登录
var curAddr = '0';


function GetSomeEther() {
    if (curAddr == '0') {
        display("You haven`t signed in !");
        return;
    }
	sendTx(initAddr,curAddr,'0.1');
    display("You got 0.1 ether.");
	setTimeout(function(){web3.eth.getBalance(curAddr, (err, res) => { if (err) console.log("Error: ", err); else $("#TokensInfo-6").html(res + '  Wei'); })},1000);
}

function sendTx(addrFrom,addrTo,ethFor){
	web3.eth.sendTransaction(
		{ 
			from: addrFrom, 
			to: addrTo, 
			value: web3.utils.toWei(ethFor, 'ether') 
		}, 
		(err, res) => { 
			if (err) 
				console.log("Error: ", err); 
			else 
				console.log("Result: ", res); 
		}
	);
}

function buyTok(amount){
    WalletContract.methods.buyTokens().send({ from: curAddr, value: 100000000 * amount }, (err, res) => {
        if (err)
            console.log("Error: ", err);
        else {
            console.log("Result: ", res);
            txAddr = 'Your transaction id is : ' + res.toString();
            display(txAddr);
            refresh();
        }

    })
}

function sendTok(address,amount){
    WalletContract.methods.giveTokens(address, amount).send({ from: curAddr }, (err, res) => {
        if (err) {
            console.log("Error:", err);
            display("Transaction failed.");
        }
        {
            let TokensTx = res.toString();
            display('Your transaction id is : ' + TokensTx);
            refresh();
        }
    });
}

function getAddrByKey(privateKey){
    let t = web3.eth.accounts.privateKeyToAccount(privateKey)
    return t.address;
}

function display(words){
	$("#console").html(words);
}

function refresh(){
    WalletContract.methods.balanceTokens().call((err, res) => { if (err) console.log("Error: ", err); else $("#" + "TokensInfo-2").html(res + '  tokens'); });
	WalletContract.methods.showContractEther().call((err, res) => { if (err) console.log("Error: ", err); else $("#" + "TokensInfo-4").html(res + '  Wei'); });
    WalletContract.methods.tokensOwned(curAddr).call({ from: curAddr }, (err, res) => { if (err) console.log("Error: ", err); else $("#" + "TokensInfo-5").html(res + '  tokens'); });
    web3.eth.getBalance(curAddr, (err, res) => { if (err) console.log("Error: ", err); else $("#TokensInfo-6").html(res + '  Wei'); });
}

function GetContractEther() {
    if (curAddr != devAddr) {
        display("You are not the developer !");
        return;
    }
    let extractTo = $("#extractTo").val();
    WalletContract.methods.getContractEther(extractTo).send({ from: curAddr }, (err, res) => {
        if (err) {
            console.log("Error:", err);
        }
        else {
            display('You have extracted all ether in contract to : ' + extractTo);
            refresh();
        }
    });	
}

function GiveEther() {
    if (curAddr == '0') {
        display("You haven`t signed in !");
        return;
    }
    let addrTo = $("#EtherAddrTo").val();
    let ethFor = $("#EtherNumberTo").val();
    sendTk(curAddr,addrTo,ethFor);
}

function GiveTokens() {
    if (curAddr == '0') {
        display("You haven`t signed in !");
        return;
    }
    let address = $("#TokensAddrTo").val();
    let amount = $("#TokensNumberTo").val();
    sendTok(address,amount);
}

function newAc(password) {
    web3.eth.personal.newAccount(password, (err, res) => {
        if (err) {
            console.log("Error: ", err);
            display("Your password is not valid");
        }
        else {
            console.log("Result: ", res);
            let addUp = 'Your new account address is : ' + res.toString();
            $("#" + "console").html(addUp);
        }
    });
}

function unlockAc(address,password) {
    web3.eth.personal.unlockAccount(address, password, 3600, (err, res) => {
        if (err) {
            console.log("Error: ", err);
            $("#" + "console").html('Password error , please try again!');
        }
        else {
            console.log("Result: ", res);
            let addIn = 'Welcome : ' + address;
            $("#" + "console").html(addIn);
            curAddr=address;
            refresh();
			changeLink();
		}
    });
}

function SignUp() {
    let password = $("#password-signup").val();
    newAc(password);
}

function SignIn() {
    let address = $("#address-signin").val();
    let password = $("#password-signin").val();
    unlockAc(address,password);
}

function SignOut() {
    web3.eth.personal.lockAccount(curAddr);
    curAddr = '0';
    $("#" + "console").html("You have signed out.Your account has been locked.");
	$("#TokensInfo-5").html("");
	$("#TokensInfo-6").html("");
}

function buyTokens() {
    if (curAddr == '0') {
        display("You haven`t signed in !");
        return;
    }
    let tokensToBuy = $("#tokensToBuy").val();
    buyTok(tokensToBuy);
}

function checkit(isChecked) {
    if (isChecked) {
        $("#password-signin").prop("type", 'text');
        $("#password-signup").prop("type", 'text');
		$("#pwdToAc").prop("type", 'text');
		$("#pwdToMn").prop("type", 'text');
		$("#keystore-pwd").prop("type", 'text');
    } else {
        $("#password-signin").prop("type", 'password');
        $("#password-signup").prop("type", 'password');
		$("#pwdToAc").prop("type", 'password');
		$("#pwdToMn").prop("type", 'password');
		$("#keystore-pwd").prop("type", 'password');
    }
}





function checkTx() {
    let TransactionId = $("#transaction-id").val();
    web3.eth.getTransaction(TransactionId, (err, res) => {
        if (err) {
            console.log("Error: ", err);
            display("The transaction id is invalid.");
        }
        else {
            console.log("Result: ", res);
            display("Press F12 to watch the transaction details");
        }
    });
}

function checkBk() {
    let BlockId = $("#block-id").val();
    web3.eth.getBlock(BlockId, (err, res) => {
        if (err) console.log("Error: ", err);
        else {
            console.log(res);
            display("Press F12 to watch the transaction details");
        }
    })
}

var keystore = null;

function importfile(){
    var selectedFile = document.getElementById("files").files[0];
    var name = selectedFile.name;
    var size = selectedFile.size;
    console.log("文件名:"+name+"大小："+size);

    var reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.onload = function(){
        console.log(this.result);
        keystore = this.result;
    };
}

function readKeystore() {

    let keystorePwd = $("#keystore-pwd").val()

    if(keystorePwd == "")
    {
        console.log("please input password")
        return
    }

    if(keystore === null)
    {
        console.log("please input keystore file")
        return;
    }

    let ob = null
    try{
        ob = web3.eth.accounts.decrypt(keystore, keystorePwd)
    }catch(e){
        console.log(e)
        //
    }
    if(ob)
    {
		let address=getAddrByKey(ob.privateKey);
		unlockAc(address,keystorePwd);
    }
}

function keyToSignUp(privateKey,password){
    web3.eth.personal.importRawKey(privateKey.slice(2),password, (err, res) => {
        if (err) {
            console.log("Error: ", err);
            display('Error occuerd . Press F12 to see details!')
        }
        else{
            unlockAc(res,password);
        }
    })
}

function keyToSignIn(privateKey,password){
    let address=getAddrByKey(privateKey);
    unlockAc(address,password);
}

function keyUpAccount(){
	let privateKey = $("#keyToAc").val();
	let password = $("#pwdToAc").val();
	keyToSignUp(privateKey,password);

}

function keyInAccount(){
    let privateKey = $("#keyToAc").val();
	let password = $("#pwdToAc").val();
	keyToSignIn(privateKey,password);
}

function getWords() {
    let wordsToAc = $('#wordsToAc');
	let mnKey=ethers.utils.randomBytes(32);
    let mnemonic = ethers.utils.entropyToMnemonic(mnKey);
    wordsToAc.val(mnemonic);
	console.log(mnKey);
}

function wordsUpAccount(){
    let wordsToAc = $('#wordsToAc');
	let password = $('#pwdToMn').val;
	let privateKey = ethers.utils.mnemonicToEntropy(wordsToAc.val());
    keyToSignUp(privateKey,password);
}

function wordsInAccount(){
    let wordsToAc = $('#wordsToAc');
	let password = $('#pwdToMn').val;
	let privateKey = ethers.utils.mnemonicToEntropy(wordsToAc.val());
    unlockAc(getAddrByKey(privateKey),password);
}

  
function changeLink()
	{
		let keySlice=curAddr.slice(2);		
		let skeySlice=keySlice.toLowerCase();
		let url="keystore/"+skeySlice;
		document.getElementById('dl').href=url;
		document.getElementById('dl').target="_blank";
	}

$(document).ready(function () {
    WalletContract.methods.totalTokens().call((err, res) => {
        if (err) console.log("Error: ", err);
        else $("#" + "TokensInfo-1").html(res + '  tokens');
    });

    WalletContract.methods.balanceTokens().call((err, res) => {
        if (err) console.log("Error: ", err);
        else $("#" + "TokensInfo-2").html(res + '  tokens');
    });

    WalletContract.methods.tokenPrice().call((err, res) => {
        if (err) console.log("Error: ", err);
        else $("#" + "TokensInfo-3").html(res + '  Wei');
    });

    WalletContract.methods.showContractEther().call((err, res) => {
        if (err) console.log("Error: ", err);
        else $("#" + "TokensInfo-4").html(res + '  Wei');
    });


    $("")

});
