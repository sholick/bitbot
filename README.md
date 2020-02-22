## CryptoBot - The cryptocurrency information assistant
Cryptocurrency assistant that provides general crypto knowledge, basic price checking, bitcoin-related inquiries, and price-chart plotting functionality. Currently, the bot is coded to serve on web channels via an AWS instance. More dialogs and features are coming.

**See it in action!** [Click here](https://chanvictor.io/bot)<br/>
New features coming soon.
<br/><br/>
#### 1.0 **Functionalities:**
1. Cryptocurrency information retrieval
2. Real-time Cryptocurrency price check (1000+ currencies)
3. Price Chart plotting for certain period of time
<br/><br/>
#### 1.1 **Functions in development:**
1. Integration with channels like Telegram and Google Assistant.
2. Trade functionality on Binance using personal credentials
3. Setting up price alert and watchlist
4. Fetching latest news across different channels

To receive and process dialogflow webhooks, you will need a working domain to receive and send the API calls.<br/>
If you don't have one, try [ngrok.io](https://ngrok.io).


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
