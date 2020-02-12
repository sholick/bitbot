from flask import Flask, request, jsonify, render_template
import os
import dialogflow
import requests
import json
import pusher

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')

# run Flask app
if __name__ == "__main__":
	app.run()


@app.route('/get_price', methods=['POST'])
def get_price():
	data = request.get_json(silent=True)
	crypto = data['queryResult']['parameters']['Crypto']

	string = 'http://api.coingecko.com/api/v3/simple/price?ids={0}&vs_currencies=usd&include_24hr_change=true'.format(crypto)
	price_detail = requests.get(string).text
	price_detail = json.loads(price_detail)
	print(string)

	response = """
		Crypto : {0}\n
		Price : {1}\n
		Change : {2}
	""".format(crypto, price_detail[crypto]['usd'], price_detail[crypto]['usd_24h_change'])

	reply = {
		"fulfillmentText": response,
	}

	return jsonify(reply)

def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    print(session,"\n")

    if text:
       text_input = dialogflow.types.TextInput(text=text, language_code=language_code)
       query_input = dialogflow.types.QueryInput(text=text_input)
       response = session_client.detect_intent(session=session, query_input=query_input)

       return response.query_result.fulfillment_text

@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form['message']
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    key_name = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    print(key_name)
    fulfillment_text = detect_intent_texts(project_id, "001", message, 'en')
    response_text = { "message":  fulfillment_text }

    return jsonify(response_text)

