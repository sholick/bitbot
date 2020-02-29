## CryptoBot - The cryptocurrency information assistant
General purpose cryptocurrency chatbot that offers crypto knowledge, basic price checking, and price-chart plotting functions. Currently, the bot is designed to serve on a python server, be it a private hosted one or a local running instance. In the sample , it is served on Amazon Web Services via Elasticbeanstalk. We are adding more dialogs and features every week or so, so stay tuned!
<br/><br/>
**See it in action!** [Click here](https://chanvictor.io/bot)<br/><br/>
New features (25-Feb):<br/>
"Top News" to display 5 top news in cryptocurrency;<br/>
"News for {coin_name}" intent to fetch news for a specific coin.
<br/><br/>
#### 1.0 **Functionalities:**
1. Cryptocurrency information retrieval
2. Real-time Cryptocurrency price check (1000+ currencies)
3. Price Chart plotting for certain period of time
<br/><br/>
#### 1.1 **Functions in development:**
1. Implementation on other channels like Telegram and Google Assistant
2. Trade functionality on Binance using personal credentials
3. Setting up price alert and  crypto watchlist
4. ~~Fetching latest news across different news sites, either through a scraping script by the server or relying on other news APIs~~


#### Notes to a successful deployment
To receive and process dialogflow webhooks, you will need a working domain to receive and send the API calls.<br/>
Due to Dialogflow's security requirements, this domain need to serve with HTTPS encryption.
If you don't have one, try [ngrok.io](https://ngrok.io) when you start off.


#### 2.0 **Setup Instructions**<br/>
1. Download the Dialogflow agent and deploy your agent using the zip file.<br/>
2. Obtain API key for both [coingecko](coingecko.com) and [coinmarketcap](coinmarketcap.com).<br/>
2.5 If you want news functionality you may also consider obtaining an API key from [cryptocontrol](https://cryptocontrol.io/).
3. Place the API keys in the respective positions of the folder.<br/>
4. Set the .env variables so the application can get the keys when using the intent. This should include the chatbot project name, bot access key file name, and the API keys.
<br/>
Note: While Coingecko's API is free-to-use, Coinmarketcap's free plan is limited to 300 API calls/day. To minimize the reliance on coinmarketcap and the impact of running out of quota, this bot is coded to obtain info from Coinmarketcap only when fetching the coin list and individual coin's info. Functions like coin's current price and plotting coin price chart uses only coingecko API.<br/>
If you have a Pro account or more than one key, feel free to add in your own.


You will need a dialogflow agent which handles the enquiries and forward requests to your webhook when needed.
<br/><br/>
#### 2.1 Diagflow agent linking:
1) Access keys has to be downloaded and placed into the main directory.
2) GO to .env and change the name to your dialogflow key.json file
<br/><br/>
#### 2.2 Libraries used:
1) Moment.js
2) Chart.js
3) font-awesome.css
