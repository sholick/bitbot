from flask import Flask, request, jsonify, render_template
import os
import dialogflow
import requests
import json
import pusher
import math

app = Flask(__name__)
CMC_key = "48ed09a4-e701-4524-883b-93962eb66652"
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

def cf(string):
	return string.casefold()

def message_make(list):
	result = []
	for _str in list:
		big_dict = {"text": {"text": [_str]}}
		result.append(big_dict)
	return result

def get_ids_gecko():
	print("getting gecko ids")
	get_id = 'http://api.coingecko.com/api/v3/coins/list'
	id_detail = requests.get(get_id).text
	id_detail = json.loads(id_detail)
	return id_detail

def get_cmc_symbols(params, headers):
	print("getting CMC symbol")
	response = requests.get(check_url, params = params, headers=headers)
	data = json.loads(response.text)
	symbols = [str(i['id']) for i in data['data']]
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
def index():
	return render_template('index.html')

# run Flask app
if __name__ == "__main__":
	app.run()


@app.route('/web_hook', methods=['POST'])
def switch_cases():

	global gecko_ids, CMC_symbols
	global check_url, meta_url, price_url

	data = request.get_json(silent=True)
	intentName = data['queryResult']['intent']['displayName']
	crypto = ""
	if 'Crypto' in data['queryResult']['parameters']:
		crypto = data['queryResult']['parameters']['Crypto']
	
	print(intentName)

	if intentName == "Price":

		if not len(gecko_ids):
			gecko_ids = get_ids_gecko()

		found = []
		print("to Match: " + crypto)
		for i in gecko_ids:
			if cf(i['name']) == cf(crypto) or cf(i['symbol']) == cf(crypto) or cf(i['id']) == cf(crypto):
				found.append(i)

		if not len(found):
			response = "Crypto not found.<br>Mind if you try again with another name?"

		else:
			_id = found[0]['id']
			string = 'http://api.coingecko.com/api/v3/simple/price?ids={0}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'.format(_id)
			#print(intentName)
			price_detail = requests.get(string).text
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
			print("getting gecko ids")
			gecko_ids = get_ids_gecko()

		dur = '14'
		if  len(data['queryResult']['parameters']['duration']):
			dur = str(int(data['queryResult']['parameters']['duration']['amount']))
			unit = str(data['queryResult']['parameters']['duration']['unit'])

			if unit in dur_dict:
				dur = str(math.ceil(int(dur) * dur_dict[unit]))
		print("duration found: " + dur)

		found = []
		print("to Match: " + crypto)
		for i in gecko_ids:
			if cf(i['name']) == cf(crypto) or cf(i['symbol']) == cf(crypto) or cf(i['id']) == cf(crypto):
				found.append(i)

		if not len(found):
			reply = {
			"fulfillmentText": "Crypto not found.<br>Mind if you try again with another name?",
			}
			return jsonify(reply)

		else:
			string = 'http://api.coingecko.com/api/v3/coins/{0}/market_chart?vs_currency=usd&days={1}'.format(found[0]['id'], dur)
			price_detail = requests.get(string).text
			price_detail = json.loads(price_detail)

			priceList = [i[1] for i in price_detail['prices']]
			priceString = 'Chart__PloT__' + crypto + '__' + dur + ' day(s)__' + ','.join([str(i) for i in priceList])
			reply={
				"fulfillmentText": priceString
			}
			return jsonify(reply)
			

	elif intentName == "What_is_XX":

		parameters = {
			'limit': 1000,
			'sort': 'cmc_rank'
		}
		headers = {
			'Accepts': 'application/json',
			'X-CMC_PRO_API_KEY': CMC_key,
		}

		response = requests.get(check_url, params = parameters, headers=headers)
		data = json.loads(response.text)
		#print(data)
		
		found = []
		#print(crypto)
		for i in data['data']:
			if cf(i['name']) == cf(crypto) or cf(i['symbol']) == cf(crypto) or cf(i['slug']) == cf(crypto):
				found.append(i)

		reply={
				"fulfillmentText" : "I cannot find information of this currency.<br/>Mind if you retry?"
			}

		if found:
			ids = ','.join(str(i['id']) for i in found)
			#print(ids)
			parameters.clear()
			parameters['id'] = ids
			response = requests.get(meta_url, params = parameters, headers=headers)
			metadata = json.loads(response.text)
			#print(metadata['data'])
			crix = metadata['data'][str(found[0]['id'])]
			
			tech_doc = ""
			if len(crix['urls']['technical_doc']):
				tech_doc = " and their <a href='{0}' target='_blank'>white paper</a>".format(crix['urls']['technical_doc'][0])
			line_1 = "<h3><img class='crixlogo' src='{0}'' />{1}</h3>{2}".format(crix['logo'], crix['name'], crix['description'])
			line_2 = "Feel free to check out their <a href='{0}' target='_blank'>website</a>".format(crix['urls']['website'][0]) + tech_doc +  " for more in-depth information!"
			_messages = message_make([line_1, line_2])

			reply = {
				#"fulfillmentText": "<h3>{1} <img class='crixlogo' src='{0}'' /></h3>{2}".format(crix['logo'], crix['name'], crix['description'])
				"fulfillmentMessages": _messages
			}

		return jsonify(reply)

	elif intentName == 'List':

		parameters = {
			'limit': 20,
			'sort': 'cmc_rank'
		}
		headers = {
			'Accepts': 'application/json',
			'X-CMC_PRO_API_KEY': CMC_key,
		}
		if not len(CMC_symbols):
			CMC_symbols = get_cmc_symbols(parameters, headers)

		response = requests.get(meta_url, {'id': ','.join(CMC_symbols)}, headers=headers)
		metadata = json.loads(response.text)
		metadata = metadata["data"]

		line_1 = "The top 20 cryptocurrencies are as follows:<br/><br/>"
		line_2 = "Type in one of the coin's name to know more!"
		for i, _id in enumerate(CMC_symbols, 1):
			line_1 += '{0:3}. <img class="crixlogo" src= "{1}"/>{2}<br/>'.format(i, metadata[_id]["logo"], metadata[_id]["name"])
		newmessage = message_make([line_1, line_2])
		reply={
			"fulfillmentMessages": newmessage
		}

		return jsonify(reply)

def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    #print(session,"\n")

    if text:
       text_input = dialogflow.types.TextInput(text=text, language_code=language_code)
       query_input = dialogflow.types.QueryInput(text=text_input)
       response = session_client.detect_intent(session=session, query_input=query_input)

       resp_list = [i.text.text[0] for i in response.query_result.fulfillment_messages]
       #print(response.query_result.fulfillment_messages)
       #print(response.query_result.fulfillment_messages[1])
       #print(resp_list)
       return resp_list

@app.route('/send_message', methods=['POST'])
def send_message():

    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    key_name = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    #print(key_name)
    fulfillment_messages = detect_intent_texts(project_id, "001", message, 'en')
    response_text = { "message":  fulfillment_messages }

    return jsonify(response_text)

