# bitbot
Cryptocurrency assistant, providing price checking, momentum analysis.
More features coming soon!

Current functionalities:
1. Crypto information retrieval
2. Real-time Cryptocurrency price check (1000+ currencies)
3. Price Chart plotting for certain period of time

Planning:
1. Trade functionality on Binance using personal credentials
2. Setting up price alert and watchlist

To receive dialogflow webhooks, you will need a working domain to receive and send the API calls.
If you don't have one, try [ngrok.io](ngrok.io)

**See it live!** [Click here](https://chanvictor.io)<br/>

**Setup Instructions**
In order for this bot to function properly, you need to obtain an API key for both coingecko.com and coinmarketcap.com.
After doing so, you can place the API keys in the respective positions of the folder.

You will need a dialogflow agent which handles the enquiries and forward requests to your webhook when needed.

Diagflow agent linking:
1) Access keys has to be downloaded and placed into the main directory.
2) GO to .env and change the name to your dialogflow key.json file


Javascript Libraries used:
1) Chart.js
2) moment.js
