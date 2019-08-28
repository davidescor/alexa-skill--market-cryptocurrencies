/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const startVoice = 'Entrando al mercado de criptomonedas. Dime el nombre de la criptomoneda para saber su precio, o quieres saber el precio de las 5 criptomonedas que tienen mas valor?';
const helpGame = 'Dime el nombre de la criptomoneda para saber su precio, o quieres saber el precio de las 5 criptomonedas que tienen mas valor?';


const https = require('https');

var json_data;
const name_crypto = [];
const price_usd = [];


var req = https.get("https://api.coinmarketcap.com/v1/ticker/?limit=0", function(res) {
  
var data = '';
        
    res.on('data', function(stream) {
    	data += stream;
    });
    
    res.on('end', function() {
        json_data = JSON.parse(data);
        		
        for (var i = 0; i < 100; i++) {
          
            var name_crypto_lower = json_data[i].name;
            name_crypto[i] = name_crypto_lower.toLowerCase();
            
            var number = json_data[i].price_usd;
            var number_round = Math.round( number * 1000 ) / 1000; 
            var number_string = number_round.toString();
            var number_replace = number_string.replace(".",",");
            price_usd[i] = number_replace;
            
        }
        		
        });
});

function list_crypto(name_crypto,price_usd){
  
    var speak_crypto = "Las 5 monedas con más valor són, "
    
    for (var i = 0; i <= 4 ; i++) {
      speak_crypto += name_crypto[i]+" tiene un precio de "+price_usd[i]+"$. ";
    }
    
    return speak_crypto;

}

function individualCrypto(crypto,name_crypto,price_usd){
  
  var speak_crypto;
  
    for (var i = 0; i < name_crypto.length ; i++) {
      
      var crypto_say = crypto.toLowerCase();
      
      if(name_crypto[i] == crypto_say){
        
        speak_crypto = "Un "+name_crypto[i]+" tiene un precio de "+price_usd[i]+"$. ";
        break;
        
      }else{
        speak_crypto = "No he podido encontrar esta criptomoneda.";
      }
    
    }

  return speak_crypto;

}

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(startVoice)
      .reprompt(startVoice)
      .getResponse();
  },
};

const listCryptoHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'listCrypto';
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(list_crypto(name_crypto,price_usd))
      .reprompt(startVoice)
      .getResponse();
  },
};

const individualCryptoHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'individualCrypto';
  },
  handle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    const crypto = request.intent.slots.cryptocurrencies.value;
    
    return handlerInput.responseBuilder
      .speak(individualCrypto(crypto,name_crypto,price_usd))
      .reprompt(startVoice)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(helpGame)
      .reprompt(startVoice)
      .getResponse();
  },
};


const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {

    return handlerInput.responseBuilder
      .speak('Saliendo del mercado de criptomonedas, hasta pronto.')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};



const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Ha ocurrido un error.')
      .reprompt('Ha ocurrido un error.')
      .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    listCryptoHandler,
    individualCryptoHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
