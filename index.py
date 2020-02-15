from flask import Flask, request, jsonify, render_template
import os
import dialogflow
import requests
import json
import pusher

app = Flask(__name__)
CMC_key = "48ed09a4-e701-4524-883b-93962eb66652"

def cf(string):
	return string.casefold()

def message_make(list):
	result = []
	for _str in list:
		big_dict = {"text": {"text": [_str]}}
		result.append(big_dict)
	return result

@app.route('/')
def index():
	return render_template('index.html')

# run Flask app
if __name__ == "__main__":
	app.run()


@app.route('/web_hook', methods=['POST'])
def switch_cases():

	data = request.get_json(silent=True)
	intentName = data['queryResult']['intent']['displayName']
	crypto = data['queryResult']['parameters']['Crypto']

	check_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map'
	meta_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/info'
	price_url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
	

	if intentName == "Price":

		string = 'http://api.coingecko.com/api/v3/simple/price?ids={0}&vs_currencies=usd&include_24hr_change=true'.format(crypto)
		#print(intentName)
		price_detail = requests.get(string).text
		price_detail = json.loads(price_detail)

		if not price_detail:
			response = "Crypto not found.<br>Mind if you try again?"

		else: 
			response = """
				{0}<br>
				Price : {1}<br>
				Change (24h) : {2:.2%}
			""".format(crypto, price_detail[crypto]['usd'], price_detail[crypto]['usd_24h_change'] / 100)

		reply = {
			"fulfillmentText": response,
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

def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    #print(session,"\n")

    if text:
       text_input = dialogflow.types.TextInput(text=text, language_code=language_code)
       query_input = dialogflow.types.QueryInput(text=text_input)
       response = session_client.detect_intent(session=session, query_input=query_input)

       resp_list = [i.text.text[0] for i in response.query_result.fulfillment_messages]
       print(response.query_result.fulfillment_messages)
       #print(response.query_result.fulfillment_messages[1])
       #print(resp_list)
       return resp_list

@app.route('/send_message', methods=['POST'])
def send_message():

    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    key_name = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    print(key_name)
    fulfillment_messages = detect_intent_texts(project_id, "001", message, 'en')
    response_text = { "message":  fulfillment_messages }

    return jsonify(response_text)

