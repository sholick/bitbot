## CryptoBot - The cryptocurrency information assistant
Cryptocurrency assistant that provides general crypto knowledge, basic price checking, bitcoin-related inquiries, and price-chart plotting functionality. momentum analysis and news providing features are coming.

More features coming soon!
<br/><br/>
#### 1.0 **Current functionalities:**
1. Crypto information retrieval
2. Real-time Cryptocurrency price check (1000+ currencies)
3. Price Chart plotting for certain period of time
<br/><br/>
#### 1.1 **Upcoming plans:**
1. Google Assistant integration
2. Trade functionality on Binance using personal credentials
3. Setting up price alert and watchlist

To receive dialogflow webhooks, you will need a working domain to receive and send the API calls.<br/>
If you don't have one, try [ngrok.io](https://ngrok.io) for free.

**See it in action!** [Click here](https://chanvictor.io)<br/>

**Setup Instructions**<br/>
In order for this bot to function properly, you need to obtain an API key for both coingecko.com and coinmarketcap.com.
After doing so, you can place the API keys in the respective positions of the folder.

You will need a dialogflow agent which handles the enquiries and forward requests to your webhook when needed.
<br/><br/>
Diagflow agent linking:
1) Access keys has to be downloaded and placed into the main directory.
2) GO to .env and change the name to your dialogflow key.json file
<br/><br/>
Javascript Libraries used:
1) Moment.js
2) Chart.js
