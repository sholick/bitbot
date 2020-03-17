from flask import Flask, request, jsonify, render_template, abort
from crypto_news_api import CryptoControlAPI
import os
import dialogflow_v2
import requests
import json
import pusher
import math
import sqlite3
import random
import string

application = Flask(__name__)
app = application
dialogflow = dialogflow_v2


news_api_key = "Your key here"
news_api = CryptoControlAPI(news_api_key)

CMC_key = "Your key here"
CMC_symbols = []
gecko_ids = []
dur_dict = {
	'mo' : 30,
	'yr' : 365,
	'day' : 1,
	'wk' : 7,
	'h' : 1/24,
	'min': 1/24/60 
}
check_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map'
meta_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/info'
price_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'

cmc_params = {
	'limit': 1000,
	'sort': 'cmc_rank'
}
cmc_headers = {
	'Accepts': 'application/json',
	'X-CMC_PRO_API_KEY': CMC_key,
}

def cf(text):
	return text.casefold()

def message_make(list):
	result = []
	for _str in list:
		big_dict = {"text": {"text": [_str]}}
		result.append(big_dict)
	inJson = {
		"fulfillmentMessages": result
	}
	return inJson

def get_ids_gecko():

	get_id = 'http://api.coingecko.com/api/v3/coins/list'
	id_detail = requests.get(get_id).text
	id_detail = json.loads(id_detail)
	return id_detail

def get_cmc_symbols(params, headers):

	response = requests.get(check_url, params = params, headers=headers)
	data = json.loads(response.text)
	symbols = [[str(i['id']), i['name'], i['symbol'], i['slug']] for i in data['data']]
	return symbols

def bigParser(number):
	if number > 1000000000:
		return str(int(number)//1000000000) + 'B'
	elif number > 1000000:
		return str(int(number)//1000000) + 'M'
	elif number > 1000:
		return str(int(number)//1000) + "K"
	else:
		if (number is not None):
			return str(int(number))
		else:
			return "-"

def priceChangeParser(number):
	if number:
		return str(round(number, 2)) + "%"
	else:
		return "-"

@app.route('/')
def resume():
	return render_template('intro.html')

@app.route('/bot')
def index():
	return render_template('index.html')

# run Flask app
if __name__ == "__main__":
	app.run()


@app.route('/web_hook', methods=['POST'])
def switch_cases():

	global gecko_ids, CMC_symbols
	global check_url, meta_url, price_url
	global cmc_params, cmc_headers
	global news_api

	data = request.get_json(silent=True)
	intentName = data['queryResult']['intent']['displayName']
	crypto = ""
	if 'Crypto' in data['queryResult']['parameters']:
		crypto = data['queryResult']['parameters']['Crypto']
	
	#print(intentName)

	if intentName == "Price":

		if not len(gecko_ids):
			gecko_ids = get_ids_gecko()

		found = []

		for i in gecko_ids:
			if cf(i['name']) == cf(crypto) or cf(i['symbol']) == cf(crypto) or cf(i['id']) == cf(crypto):
				found.append(i)

		if not len(found):
			response = "Crypto not found.<br>Mind if you try again with another name?"

		else:
			_id = found[0]['id']
			link = 'http://api.coingecko.com/api/v3/simple/price?ids={0}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'.format(_id)
			price_detail = requests.get(link).text
			price_detail = json.loads(price_detail)
			response = """
				<strong>{0}</strong><br>
				Price (USD): {1}<br>
				Change (24h) : {2}<br/>
				Volume (24hr) : {3}
			""".format(found[0]['name'], price_detail[_id]['usd'], priceChangeParser(price_detail[_id]['usd_24h_change']), bigParser(price_detail[_id]['usd_24h_vol']))

		reply = {
			"fulfillmentText": response,
		}

		return jsonify(reply)

	elif intentName == "Graph":

		if not len(gecko_ids):
			gecko_ids = get_ids_gecko()

		dur = '14'
		if  len(data['queryResult']['parameters']['duration']):
			dur = str(int(data['queryResult']['parameters']['duration']['amount']))
			unit = str(data['queryResult']['parameters']['duration']['unit'])

			if unit in dur_dict:
				dur = str(math.ceil(int(dur) * dur_dict[unit]))

		found = []

		for i in gecko_ids:
			if cf(i['name']) == cf(crypto) or cf(i['symbol']) == cf(crypto) or cf(i['id']) == cf(crypto):
				found.append(i)

		if not len(found):
			reply = {
			"fulfillmentText": "Crypto not found.<br>Mind if you try again with another name?",
			}
			return jsonify(reply)

		else:
			link = 'http://api.coingecko.com/api/v3/coins/{0}/market_chart?vs_currency=usd&days={1}'.format(found[0]['id'], dur)
			price_detail = requests.get(link).text
			price_detail = json.loads(price_detail)

			code = 'c' + ''.join([random.choice(string.ascii_letters + string.digits) for n in range(7)])
			print(code)
			con_charts = sqlite3.connect('charts.db')
			c = con_charts.cursor()

			inserts = [(i[0], i[1]) for i in price_detail['prices']]

			c.execute('CREATE TABLE ' + code + '(date integer, price integer)')
			c.executemany('INSERT INTO ' + code + ' VALUES (?,?)', inserts)
			con_charts.commit()
			con_charts.close()
			

			priceList = [i[1] for i in price_detail['prices']]
			priceString = 'Chart__PloT__' + crypto + '__' + dur + ' day(s)__' + code + '__' + ','.join([str(i) for i in priceList])
			reply={
				"fulfillmentText": priceString
			}
			return jsonify(reply)
			

	elif intentName == "What_is_XX":

		if not len(CMC_symbols):
			CMC_symbols = get_cmc_symbols(cmc_params, cmc_headers)

		found = []
		for i in CMC_symbols:
			if cf(i[1]) == cf(crypto) or cf(i[2]) == cf(crypto) or cf(i[3]) == cf(crypto):
				found.append(i)

		reply={
				"fulfillmentText" : "I cannot find information of this currency.<br/>Mind if you retry?"
			}

		if found:
			ids = ','.join(str(i[0]) for i in found)
			parameters = {
				'id': ids
			}
			response = requests.get(meta_url, params = parameters, headers = cmc_headers)
			metadata = json.loads(response.text)
			#print(metadata['data'])
			crix = metadata['data'][str(found[0][0])]
			
			tech_doc = ""
			if len(crix['urls']['technical_doc']):
				tech_doc = " and their <a href='{0}' target='_blank'>white paper</a>".format(crix['urls']['technical_doc'][0])
			line_1 = "<h3><img class='crixlogo' src='{0}'' />{1}</h3>{2}".format(crix['logo'], crix['name'], crix['description'])
			line_2 = "Feel free to check out their <a href='{0}' target='_blank'>website</a>".format(crix['urls']['website'][0]) + tech_doc +  " for more in-depth information!"
			_messages = message_make([line_1, line_2])

			return jsonify(_messages)

		return jsonify(reply)

	elif intentName == 'List':

		if not len(CMC_symbols):
			CMC_symbols = get_cmc_symbols(cmc_params, cmc_headers)

		t_symbols = list(map(list, zip(*CMC_symbols)))[0][:20]
		response = requests.get(meta_url, {'id': ','.join(t_symbols)}, headers = cmc_headers)
		metadata = json.loads(response.text)
		metadata = metadata["data"]

		line_1 = "The top 20 cryptocurrencies are as follows:<br/><br/>"
		line_2 = "Type in one of the coin's name to know more!"
		for i, _id in enumerate(t_symbols, 1):
			line_1 += '{0}.&nbsp;&nbsp;<img class="crixlogo" src= "{1}"/>{2}<br/>'.format(i, metadata[_id]["logo"], metadata[_id]["name"])
		newMessage = message_make([line_1, line_2])

		return jsonify(newMessage)


	elif intentName == 'News':

		if not len(crypto):
			topNews = news_api.getTopNews("en")
			toReturn = 'NeWs_!*_RanDOMEncodERx_!*__!*_'

		else:
			if not len(CMC_symbols):
				CMC_symbols = get_cmc_symbols(cmc_params, cmc_headers)

			found = []
			for i in CMC_symbols:
				if cf(i[1]) == cf(crypto) or cf(i[2]) == cf(crypto) or cf(i[3]) == cf(crypto):
					found.append(i)

			if found:
				topNews = news_api.getTopNewsByCoin(found[0][3], 'en')
				toReturn = 'NeWs_!*_RanDOMEncodERx_!*_' + crypto + '_!*_'

		
		for i in range(5):
			toReturn = toReturn + topNews[i]['title'] + '</>' + topNews[i]['url'] + '</>' + topNews[i]['sourceDomain'] + '</>' + str(topNews[i]['words'] // 200) + '<!>'
		
		newMessage = message_make([toReturn])

		return jsonify(newMessage)
		



def detect_intent_texts(project_name, session_id, text, language_code):

    projectID = os.getenv("PROJECT_ID_" + project_name)
    session_client = dialogflow.SessionsClient.from_service_account_file(filename = os.getenv(project_name))
    session = session_client.session_path(projectID, session_id)
	#print(session,"\n")

    if text:
       text_input = dialogflow.types.TextInput(text=text, language_code=language_code)
       query_input = dialogflow.types.QueryInput(text=text_input)
       response = session_client.detect_intent(session=session, query_input=query_input)

       resp_list = [i.text.text[0] for i in response.query_result.fulfillment_messages]
       return resp_list

    return False

@app.route('/send_message', methods=['POST'])
def send_message():

    message = request.form['message']
    projectName = request.form['to']
    fulfillment_messages = detect_intent_texts(projectName, "001", message, 'en')
    response_text = { "message":  fulfillment_messages }

    return jsonify(response_text), 200

@app.route('/chart/<code>')
def chartPage(code):

	con_charts = sqlite3.connect('charts.db')
	c = con_charts.cursor()
	command = "SELECT * FROM " + code
	try:
		data = c.execute(command)
	except sqlite3.OperationalError:
		abort(404)

	_list = []
	_labels = []
	for i in data:
		_list.append(str(i[1]))
		_labels.append(str(i[0]))

	_times = ','.join(_labels)
	_values = ','.join(_list)

	return render_template("chart.html", chartData = _times + '<?>' + _values)

@app.errorhandler(404)
def page_not_found(error):
   return render_template('404.html', title = '404'), 404